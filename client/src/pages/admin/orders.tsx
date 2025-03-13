import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Order, Product, User } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";

type OrderWithDetails = Order & {
  product: Product;
  user: User;
};

export default function Orders() {
  const { toast } = useToast();

  const { data: orders, isLoading } = useQuery<OrderWithDetails[]>({
    queryKey: ["/api/orders"],
  });

  const approveMutation = useMutation({
    mutationFn: async (orderId: number) => {
      return apiRequest("POST", `/api/orders/${orderId}/approve`);
    },
    onSuccess: () => {
      toast({
        title: "Pedido aprovado com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
    onError: (err) => {
      toast({
        title: "Erro ao aprovar pedido",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (orderId: number) => {
      return apiRequest("POST", `/api/orders/${orderId}/reject`);
    },
    onSuccess: () => {
      toast({
        title: "Pedido rejeitado",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
    onError: (err) => {
      toast({
        title: "Erro ao rejeitar pedido",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-red-600">Pedidos</h1>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-gray-100 animate-pulse rounded-lg"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {orders?.map((order) => (
            <div
              key={order.id}
              className="bg-black border border-gray-800 p-4 rounded-lg text-white"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{order.product.name}</h3>
                  <p className="text-sm text-gray-400">
                    Cliente: {order.user.name}
                  </p>
                  <p className="text-sm text-gray-400">
                    Data: {new Date(order.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xl text-red-600">
                    {formatCurrency(order.product.price)}
                  </p>
                  <span
                    className={`text-sm ${
                      order.status === 'approved'
                        ? 'text-green-500'
                        : order.status === 'rejected'
                        ? 'text-red-500'
                        : 'text-yellow-500'
                    }`}
                  >
                    {order.status === 'approved'
                      ? 'Aprovado'
                      : order.status === 'rejected'
                      ? 'Rejeitado'
                      : 'Pendente'}
                  </span>
                </div>
              </div>

              {order.status === 'pending' && (
                <div className="flex gap-2 justify-end">
                  <Button
                    onClick={() => approveMutation.mutate(order.id)}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={approveMutation.isPending}
                  >
                    <Check className="w-4 h-4 mr-2" /> Aprovar
                  </Button>
                  <Button
                    onClick={() => rejectMutation.mutate(order.id)}
                    variant="destructive"
                    disabled={rejectMutation.isPending}
                  >
                    <X className="w-4 h-4 mr-2" /> Rejeitar
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
