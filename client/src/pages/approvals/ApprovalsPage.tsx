import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  DollarSign, 
  AlertCircle,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import PageContainer from "@/components/layout/PageContainer";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ApprovalsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [comment, setComment] = useState("");
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  const { data: requests = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/approvals/requests"],
  });

  const actionMutation = useMutation({
    mutationFn: async ({ id, action, comments }: { id: number; action: 'approve' | 'reject'; comments: string }) => {
      return apiRequest("POST", `/api/approvals/requests/${id}/action`, { action, comments });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/approvals/requests"] });
      toast({
        title: t("common.success"),
        description: t("approvals.actionSuccess", "Request processed successfully"),
      });
      setSelectedRequest(null);
      setComment("");
      setActionType(null);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: error.message,
      });
    }
  });

  const handleAction = (requestWrapper: any, action: 'approve' | 'reject') => {
    setSelectedRequest(requestWrapper);
    setActionType(action);
  };

  const confirmAction = () => {
    if (!selectedRequest || !actionType) return;
    actionMutation.mutate({
      id: selectedRequest.request.id,
      action: actionType,
      comments: comment
    });
  };

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
            {t("approvals.title", "Approvals")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("approvals.subtitle", "Review and approve pending requests.")}
          </p>
        </div>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">{t("approvals.pending", "Pending Requests")}</TabsTrigger>
          <TabsTrigger value="history" disabled>{t("approvals.history", "History")}</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              {t("common.loading", "Loading...")}
            </div>
          ) : requests.length === 0 ? (
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">{t("approvals.noPending", "All caught up!")}</h3>
                <p className="text-muted-foreground">{t("approvals.noPendingDesc", "You have no pending approval requests.")}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {requests.map((req: any) => (
                <Card key={req.request.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="uppercase">
                          {req.request.entity_type.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(req.request.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                        {t("common.pending", "Pending")}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-2">
                      {req.entity?.description || req.entity?.memo || `Request #${req.request.entity_id}`}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1 mb-1">
                      {req.workflow_name && (
                        <Badge variant="outline" className="text-xs font-normal">
                          {req.workflow_name}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs font-normal">
                        Step {req.request.current_step}
                      </Badge>
                    </div>
                    <CardDescription>
                      {t("approvals.requestedBy", "Requested by")}: {req.requester?.username || req.requester?.email || 'Unknown'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center gap-2 text-lg font-bold">
                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: req.entity?.currency || 'USD' }).format(Number(req.entity?.amount || req.entity?.total || 0))}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleAction(req, 'reject')}>
                          <XCircle className="mr-2 h-4 w-4" />
                          {t("common.reject", "Reject")}
                        </Button>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleAction(req, 'approve')}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          {t("common.approve", "Approve")}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? t("approvals.confirmApprove", "Confirm Approval") : t("approvals.confirmReject", "Confirm Rejection")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              {t("approvals.commentPrompt", "Add an optional comment for the requester:")}
            </p>
            <Textarea 
              value={comment} 
              onChange={(e) => setComment(e.target.value)} 
              placeholder={t("approvals.commentPlaceholder", "e.g., Approved as per budget...")}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRequest(null)}>
              {t("common.cancel", "Cancel")}
            </Button>
            <Button 
              variant={actionType === 'reject' ? "destructive" : "default"}
              onClick={confirmAction}
              disabled={actionMutation.isPending}
            >
              {actionMutation.isPending && <Clock className="mr-2 h-4 w-4 animate-spin" />}
              {t("common.confirm", "Confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
