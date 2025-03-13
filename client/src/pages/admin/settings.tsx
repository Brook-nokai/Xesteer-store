import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Save } from "lucide-react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isOwner } from "@/lib/auth";
import { insertSettingsSchema, type Settings } from "@shared/schema";

export default function Settings() {
  const { toast } = useToast();
  const { data: user } = useQuery({ queryKey: ["/api/auth/me"] });

  // Se não for owner/sub-owner, não mostra a página
  if (!isOwner(user)) {
    return <div>Acesso negado</div>;
  }

  const { data: settings } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

  const form = useForm({
    resolver: zodResolver(insertSettingsSchema),
    defaultValues: settings || {
      mercadoPagoAccessToken: "",
      mercadoPagoWebhookSecret: "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/settings", data);
    },
    onSuccess: () => {
      toast({
        title: "Configurações atualizadas com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: (err) => {
      toast({
        title: "Erro ao atualizar configurações",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-red-600">Configurações</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))} className="space-y-4">
          <FormField
            control={form.control}
            name="mercadoPagoAccessToken"
            render={({ field }) => (
              <FormItem>
                <FormLabel>MercadoPago Access Token</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mercadoPagoWebhookSecret"
            render={({ field }) => (
              <FormItem>
                <FormLabel>MercadoPago Webhook Secret (Opcional)</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="bg-red-600 hover:bg-red-700"
            disabled={updateMutation.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </form>
      </Form>
    </AdminLayout>
  );
}