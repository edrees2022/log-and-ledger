import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  BrainCircuit, 
  TrendingUp, 
  AlertOctagon,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import PageContainer from "@/components/layout/PageContainer";
import { apiRequest } from "@/lib/queryClient";

export default function InsightsPage() {
  const { t } = useTranslation();
  const [aiEnabled, setAiEnabled] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["/api/insights", { ai: aiEnabled }],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/insights?ai=${aiEnabled}`);
      return res.json();
    }
  });

  const handleAskAI = async () => {
    setIsLoadingAI(true);
    setAiEnabled(true);
    await refetch();
    setIsLoadingAI(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertOctagon className="h-5 w-5 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'info': return <Info className="h-5 w-5 text-blue-600" />;
      default: return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-l-4 border-l-red-500';
      case 'warning': return 'border-l-4 border-l-yellow-500';
      case 'info': return 'border-l-4 border-l-blue-500';
      default: return 'border-l-4 border-l-green-500';
    }
  };

  return (
    <PageContainer>
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <BrainCircuit className="h-8 w-8 text-primary" />
            {t("accounting.insights.title", "Automated Accountant")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("accounting.insights.subtitle", "Real-time financial health checks and AI advisory.")}
          </p>
        </div>
        <Button 
          onClick={handleAskAI} 
          disabled={isLoadingAI || aiEnabled}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          {isLoadingAI ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <TrendingUp className="mr-2 h-4 w-4" />
          )}
          {t("accounting.insights.askAI", "Generate CFO Report")}
        </Button>
      </div>

      {/* AI Advice Section */}
      {data?.ai_advice && (
        <Card className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-900 flex items-center gap-2">
              <BrainCircuit className="h-5 w-5" />
              {t("accounting.insights.aiReport", "AI CFO Commentary")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-purple-800 whitespace-pre-wrap">
              {data.ai_advice}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts Grid */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            {t("common.loading", "Analyzing financial data...")}
          </div>
        ) : data?.alerts?.length === 0 ? (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">{t("accounting.insights.allGood", "All Good!")}</AlertTitle>
            <AlertDescription className="text-green-700">
              {t("accounting.insights.noIssues", "Your automated accountant found no issues or anomalies.")}
            </AlertDescription>
          </Alert>
        ) : (
          data?.alerts?.map((alert: any, index: number) => (
            <Card key={index} className={`${getBorderColor(alert.type)} shadow-sm hover:shadow-md transition-shadow`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getIcon(alert.type)}
                    <CardTitle className="text-lg font-semibold">
                      {alert.title}
                    </CardTitle>
                  </div>
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {alert.type}
                  </span>
                </div>
                <CardDescription className="mt-1 text-base">
                  {alert.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {alert.action && (
                  <div className="mt-2 p-3 bg-secondary/50 rounded-md text-sm font-medium flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    {t("common.recommendation", "Action")}: {alert.action}
                  </div>
                )}
                
                {/* Data Preview (if any) */}
                {alert.data && alert.data.length > 0 && (
                  <div className="mt-4 border rounded-md overflow-hidden">
                    <div className="bg-muted px-3 py-2 text-xs font-medium text-muted-foreground">
                      {t("common.details", "Affected Records")}
                    </div>
                    <div className="divide-y">
                      {alert.data.map((item: any, i: number) => (
                        <div key={i} className="px-3 py-2 text-sm flex justify-between">
                          <span>{item.invoice_number || item.expense_number || item.name || `#${i+1}`}</span>
                          <span className="font-mono">
                            {item.amount || item.total ? 
                              new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(item.amount || item.total)) 
                              : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </PageContainer>
  );
}
