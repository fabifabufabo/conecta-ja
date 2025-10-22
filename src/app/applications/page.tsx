"use client";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APPLICATIONS_PAGE_SIZE } from "@/lib/constants";
import { acceptJobApplication, getApplications } from "./actions";
import type { ApplicatioWithDetails } from "./schemas";
import { APPLICATIONS_STATUSES, APPLICATIONS_STATUSES_LABELS } from "./schemas";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicatioWithDetails[]>([]);
  const [totalApplications, setTotalApplications] = useState(0);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [isPending, startTransition] = useTransition();
  const [applicationStatus, setApplicationStatus] = useState<
    Record<string, "submitting" | "submitted">
  >({});

  const loadApplications = useCallback(
    async ({
      page: newPage,
      replace = false,
    }: {
      page: number;
      replace?: boolean;
    }) => {
      if (replace) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const {
        data,
        error: fetchError,
        count,
      } = await getApplications({
        page: newPage,
        pageSize: APPLICATIONS_PAGE_SIZE,
        category: selectedCategory,
      });

      if (fetchError) {
        setError(fetchError);
      } else {
        setApplications((prev) =>
          replace ? (data ?? []) : [...prev, ...(data ?? [])],
        );
        setTotalApplications(count);
        setPage(newPage);
      }

      if (replace) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    },
    [selectedCategory],
  );

  useEffect(() => {
    startTransition(() => {
      loadApplications({ page: 1, replace: true });
    });
  }, [loadApplications]);

  const handleLoadMore = () => {
    if (hasMore) {
      startTransition(() => {
        loadApplications({ page: page + 1 });
      });
    }
  };

  const handleAccept = (applicationId: string) => {
    startTransition(async () => {
      setApplicationStatus((prev) => ({
        ...prev,
        [applicationId]: "submitting",
      }));

      const result = await acceptJobApplication(applicationId);

      if (result?.error) {
        toast.error(result.error);
        setApplicationStatus((prev) => {
          const { [applicationId]: _, ...rest } = prev;
          return rest;
        });
      } else if (result?.success) {
        toast.success("Candidatura enviada com sucesso!");
        setApplicationStatus((prev) => ({
          ...prev,
          [applicationId]: "submitted",
        }));
      }
    });
  };

  const hasMore = applications.length < totalApplications;
  const isLoadingFirstTime = loading && page === 1;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2"> Propostas </h1>
        <p className="text-muted-foreground">
          Veja as propostas recebidas para os serviços que você publicou.
        </p>
        <div className="mt-4">
          <Button asChild size="lg">
            <Link href="/jobs/new">
              <Plus className="mr-2 h-4 w-4" />
              Criar Novo Serviço
            </Link>
          </Button>
        </div>
      </div>

      {/* Error message if any */}
      {error && (
        <div className="max-w-4xl mx-auto mb-6">
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="py-4">
              <p className="text-sm text-orange-800">
                ⚠️ Não foi possível carregar as propostas do servidor.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Category filter */}
      <div className="max-w-4xl mx-auto mb-8">
        <Tabs
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          className="w-full"
        >
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
            <TabsTrigger value="all">Todas</TabsTrigger>
            {APPLICATIONS_STATUSES.map((category) => (
              <TabsTrigger key={category} value={category}>
                {APPLICATIONS_STATUSES_LABELS[category]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Loading state */}
      {isLoadingFirstTime ? (
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Carregando propostas...</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {/* Results */}
          <div className="max-w-4xl mx-auto mb-6">
            <p className="text-sm text-muted-foreground">
              {totalApplications}{" "}
              {totalApplications === 1
                ? "proposta encontrada"
                : "propostas encontradas"}
            </p>
          </div>

          <div className="grid gap-6 max-w-4xl mx-auto">
            {applications.length > 0 ? (
              applications.map((application) => (
                <Card
                  key={application.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">
                          {application.jobs.title}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          Proposta enviada por: {application.profiles.full_name}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          R$ {application.jobs.value.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(application.created_at).toLocaleDateString(
                            "pt-BR",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardFooter className="justify-end gap-3">
                    <Button
                      onClick={() => handleAccept(String(application.id))}
                      disabled={
                        isPending ||
                        applicationStatus[String(application.id)] ===
                          "submitting" ||
                        applicationStatus[String(application.id)] ===
                          "submitted"
                      }
                    >
                      {applicationStatus[String(application.id)] ===
                      "submitting"
                        ? "Enviando..."
                        : applicationStatus[String(application.id)] ===
                            "submitted"
                          ? "Proposta Aceita"
                          : "Aceitar Proposta"}
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    Nenhuma proposta encontrada.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {hasMore && (
            <div className="mt-8 text-center">
              <Button
                variant="outline"
                size="lg"
                onClick={handleLoadMore}
                disabled={loadingMore || isPending}
              >
                {loadingMore ? "Carregando..." : "Carregar Mais Aplicações"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
