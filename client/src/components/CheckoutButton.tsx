import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { initMercadoPago, createPreference } from '@/lib/mercadopago';
import { Product } from '@shared/schema';

interface CheckoutButtonProps {
  product: Product;
}

export function CheckoutButton({ product }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCheckout = async () => {
    try {
      setLoading(true);

      // Initialize MercadoPago
      const mp = initMercadoPago();

      if (!mp) {
        toast({
          title: "Sistema de pagamento indisponível",
          description: "Por favor, tente novamente mais tarde.",
          variant: "destructive"
        });
        return;
      }

      // Create preference
      const preferenceId = await createPreference(product);

      // Redirect to MercadoPago Checkout
      mp.checkout({
        preference: {
          id: preferenceId
        },
        render: {
          container: '.checkout-button',
          label: 'Pagar',
        }
      });
    } catch (error: any) {
      toast({
        title: "Erro ao processar pagamento",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleCheckout} 
      disabled={loading}
      className="bg-[#4e0000] hover:bg-[#3a0000] checkout-button"
    >
      {loading ? "Processando..." : "Comprar"}
    </Button>
  );
}