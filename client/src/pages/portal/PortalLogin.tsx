import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AdBanner } from "@/components/AdBanner";

export default function PortalLogin() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/portal/login', { email, password });
      return res.json();
    },
    onSuccess: () => {
      setLocation('/portal/dashboard');
    },
    onError: () => {
      toast({
        title: t("portal.loginFailed", "Login Failed"),
        description: t("portal.invalidCredentials", "Invalid email or password"),
        variant: "destructive"
      });
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background px-4 pb-16">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t("portal.clientPortal", "Client Portal")}</CardTitle>
          <CardDescription>{t("portal.signInDescription", "Sign in to view your invoices and statements")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("common.email", "Email")}</Label>
            <Input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder={t("portal.emailPlaceholder", "you@company.com")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("common.password", "Password")}</Label>
            <Input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>
          <Button 
            className="w-full" 
            onClick={() => loginMutation.mutate()} 
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {t("common.signIn", "Sign In")}
          </Button>
        </CardContent>
      </Card>

      {/* Ad Banner */}
      <AdBanner />
    </div>
  );
}
