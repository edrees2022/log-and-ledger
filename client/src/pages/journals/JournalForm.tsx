import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, ArrowLeft, Brain, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";

interface JournalLine {
  account_id: string;
  description: string;
  debit: string;
  credit: string;
  project_id?: string;
}

export default function JournalForm() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState("");
  const [reference, setReference] = useState("");
  const [lines, setLines] = useState<JournalLine[]>([
    { account_id: "", description: "", debit: "0", credit: "0" },
    { account_id: "", description: "", debit: "0", credit: "0" }
  ]);
  
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);

  const { data: accounts = [] } = useQuery<any[]>({
    queryKey: ["/api/accounts"],
  });  const { data: projects = [] } = useQuery<any[]>({
    queryKey: ["/api/projects"],
  });

  const totalDebit = lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const createJournalMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/journals", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journals"] });
      toast({
        title: t("common.success"),
        description: t("accounting.journals.messages.created"),
      });
      setLocation("/journals");
    },
    onError: (error: any) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const aiDraftMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await apiRequest("POST", "/api/journals/draft-from-nl", { text, date });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.description) setDescription(data.description);
      if (data.lines && Array.isArray(data.lines)) {
        setLines(data.lines.map((l: any) => ({
          account_id: l.account_id || "",
          description: l.description || "",
          debit: l.debit?.toString() || "0",
          credit: l.credit?.toString() || "0"
        })));
      }
      if (data.warnings && data.warnings.length > 0) {
        toast({
          title: t("accounting.journals.aiDraftWarnings", "AI Draft Warnings"),
          description: data.warnings.join("\n"),
          variant: "default"
        });
      } else {
        toast({
          title: t("accounting.journals.draftGenerated", "Draft Generated"),
          description: t("accounting.journals.draftFromDescription", "Journal entry drafted from your description."),
        });
      }
      setIsAiDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: t("accounting.journals.aiDraftFailed", "AI Draft Failed"),
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) {
      toast({
        title: t("common.error"),
        description: t("accounting.journals.messages.balancedError"),
        variant: "destructive",
      });
      return;
    }
    if (lines.some(l => !l.account_id)) {
      toast({
        title: t("common.error"),
        description: t("accounting.journals.messages.accountError"),
        variant: "destructive",
      });
      return;
    }

    const journalData = {
      entry_date: new Date(date).toISOString(), // Map date to entry_date
      description,
      reference,
      lines: lines.map(l => ({
        account_id: l.account_id,
        description: l.description || description,
        debit: l.debit, // Send as string
        credit: l.credit, // Send as string
        project_id: l.project_id
      })).filter(l => parseFloat(l.debit) > 0 || parseFloat(l.credit) > 0)
    };

    createJournalMutation.mutate(journalData);
  };

  const addLine = () => {
    setLines([...lines, { account_id: "", description: "", debit: "0", credit: "0" }]);
  };

  const removeLine = (index: number) => {
    if (lines.length <= 2) return;
    const newLines = [...lines];
    newLines.splice(index, 1);
    setLines(newLines);
  };

  const updateLine = (index: number, field: keyof JournalLine, value: string) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    
    // Auto-balance logic for 2 lines
    if (lines.length === 2 && field === 'debit' && index === 0) {
       // If first line debit changes, maybe suggest second line credit? 
       // Let's keep it simple for now, no auto-magic that might be annoying.
    }
    
    setLines(newLines);
  };

  const handleAIDraft = () => {
    // Simple AI Draft handler - in real scenario, this might call an AI API
    const total = Math.max(totalDebit, totalCredit);
    const diff = Math.abs(totalDebit - totalCredit);
    if (totalDebit < totalCredit) {
      // Suggest to move some credit to debit
      setAiPrompt(`Consider moving ${diff.toFixed(2)} from credit to debit to balance.`);
    } else if (totalDebit > totalCredit) {
      // Suggest to move some debit to credit
      setAiPrompt(`Consider moving ${diff.toFixed(2)} from debit to credit to balance.`);
    } else {
      setAiPrompt("Your journal is balanced.");
    }
    setIsAiDialogOpen(true);
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 md:px-8 py-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/journals")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{t("accounting.journals.new")}</h1>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                {t("accounting.journals.draftWithAI", "Draft with AI")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("accounting.journals.draftJournalWithAI", "Draft Journal Entry with AI")}</DialogTitle>
                <DialogDescription>
                  {t("accounting.journals.aiDescription", "Describe the transaction in plain language (e.g., \"Bought office supplies for $50 cash\"). AI will select the accounts and amounts for you.")}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Textarea 
                  placeholder={t("accounting.journals.aiPlaceholder", "e.g. Paid $1200 for rent via bank transfer")} 
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={4}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAiDialogOpen(false)}>{t("common.cancel", "Cancel")}</Button>
                <Button 
                  onClick={() => aiDraftMutation.mutate(aiPrompt)} 
                  disabled={!aiPrompt || aiDraftMutation.isPending}
                  className="gap-2"
                >
                  {aiDraftMutation.isPending ? t("accounting.journals.drafting", "Drafting...") : (
                    <>
                      <Brain className="h-4 w-4" />
                      {t("accounting.journals.generateDraft", "Generate Draft")}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={handleSubmit} disabled={createJournalMutation.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {t("common.save")}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>{t("accounting.journals.details")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">{t("accounting.journals.date")}</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference">{t("accounting.journals.reference")}</Label>
                <Input
                  id="reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. ADJ-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t("accounting.journals.description")}</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Monthly adjustment"
                  required
                />
              </div>
            </div>

            <div className="border rounded-md overflow-x-auto">
              <Table className="min-w-[500px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">{t("accounting.journals.account")}</TableHead>
                    <TableHead>{t("accounting.journals.description")}</TableHead>
                    <TableHead className="w-[200px]">{t("accounting.journals.project")}</TableHead>
                    <TableHead className="w-[150px] text-end">{t("accounting.journals.debit")}</TableHead>
                    <TableHead className="w-[150px] text-end">{t("accounting.journals.credit")}</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lines.map((line, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Select
                          value={line.account_id}
                          onValueChange={(val) => updateLine(index, "account_id", val)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t("accounting.journals.selectAccount")} />
                          </SelectTrigger>
                          <SelectContent>
                            {accounts?.map((account: any) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.code} - {account.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={line.description}
                          onChange={(e) => updateLine(index, "description", e.target.value)}
                          placeholder={t("accounting.journals.description")}
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={line.project_id || "none"}
                          onValueChange={(value) => updateLine(index, "project_id", value === "none" ? "" : value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t("accounting.journals.selectProject")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">{t("common.none")}</SelectItem>
                            {projects.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.code} - {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          className="text-end"
                          value={line.debit}
                          onChange={(e) => {
                            updateLine(index, "debit", e.target.value);
                            if (parseFloat(e.target.value) > 0) updateLine(index, "credit", "0");
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          className="text-end"
                          value={line.credit}
                          onChange={(e) => {
                            updateLine(index, "credit", e.target.value);
                            if (parseFloat(e.target.value) > 0) updateLine(index, "debit", "0");
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLine(index)}
                          disabled={lines.length <= 2}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between items-center">
              <Button type="button" variant="outline" onClick={addLine}>
                <Plus className="me-2 h-4 w-4" />
                {t("accounting.journals.addLine")}
              </Button>
              <div className="flex gap-8 text-sm font-medium">
                <div>
                  <span className="text-muted-foreground me-2">{t("accounting.journals.totalDebit")}:</span>
                  {totalDebit.toLocaleString(i18n.language, { minimumFractionDigits: 2 })}
                </div>
                <div>
                  <span className="text-muted-foreground me-2">{t("accounting.journals.totalCredit")}:</span>
                  {totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className={isBalanced ? "text-green-600" : "text-destructive"}>
                  <span className="me-2">{t("accounting.journals.difference")}:</span>
                  {Math.abs(totalDebit - totalCredit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setLocation("/journals")}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={!isBalanced || createJournalMutation.isPending}>
                <Save className="me-2 h-4 w-4" />
                {createJournalMutation.isPending ? t("accounting.journals.saving") : t("common.save")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* AI Draft Dialog */}
      <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("accounting.journals.aiDraft.title")}</DialogTitle>
            <DialogDescription>
              {t("accounting.journals.aiDraft.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder={t("accounting.journals.aiDraft.placeholder")}
              className="resize-none h-20"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAiDialogOpen(false)}>
              {t("common.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
