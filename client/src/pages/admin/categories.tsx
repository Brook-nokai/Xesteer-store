import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Plus, Edit, Trash2 } from "lucide-react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Category, insertCategorySchema } from "@shared/schema";

export default function Categories() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const form = useForm({
    resolver: zodResolver(insertCategorySchema),
    defaultValues: selectedCategory || {
      name: "",
      slug: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/categories", {
        ...data,
        slug: data.name.toLowerCase().replace(/\s+/g, "-"),
      });
    },
    onSuccess: () => {
      toast({
        title: "Categoria criada com sucesso",
      });
      setOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    },
    onError: (err) => {
      toast({
        title: "Erro ao criar categoria",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PATCH", `/api/categories/${selectedCategory?.id}`, {
        ...data,
        slug: data.name.toLowerCase().replace(/\s+/g, "-"),
      });
    },
    onSuccess: () => {
      toast({
        title: "Categoria atualizada com sucesso",
      });
      setOpen(false);
      setSelectedCategory(null);
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    },
    onError: (err) => {
      toast({
        title: "Erro ao atualizar categoria",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/categories/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Categoria excluída com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    },
    onError: (err) => {
      toast({
        title: "Erro ao excluir categoria",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    if (selectedCategory) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#4e0000]">Categorias</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#4e0000]">
              <Plus className="mr-2 h-4 w-4" /> Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedCategory ? "Editar" : "Nova"} Categoria
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="bg-[#4e0000]"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {selectedCategory ? "Atualizar" : "Criar"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 bg-gray-100 animate-pulse rounded-lg"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {categories?.map((category) => (
            <div
              key={category.id}
              className="bg-white p-4 rounded-lg shadow border flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold">{category.name}</h3>
                <p className="text-sm text-gray-600">{category.slug}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory(category);
                    form.reset(category);
                    setOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteMutation.mutate(category.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}