"use client";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getJobs } from "./actions";
import { JOB_CATEGORIES, JOB_CATEGORY_LABELS, type Job } from "./schemas";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    async function loadJobs() {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await getJobs();

      if (fetchError) {
        setError(fetchError);
      } else {
        setJobs(data || []);
      }

      setLoading(false);
    }

    loadJobs();
  }, []);

  // TODO: Implement pagination with a "Load More" button
  // For now, we just filter the already loaded jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location_text.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || job.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Serviços Disponíveis</h1>
        <p className="text-muted-foreground">
          Encontre serviços próximos de você
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
                ⚠️ Não foi possível carregar os serviços do servidor.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Carregando serviços...</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {/* Search bar */}
          <div className="max-w-4xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por título, descrição ou localização..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category filter */}
          <div className="max-w-4xl mx-auto mb-8">
            <Tabs
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              className="w-full"
            >
              <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
                <TabsTrigger value="all">Todas</TabsTrigger>
                {JOB_CATEGORIES.map((category) => (
                  <TabsTrigger key={category} value={category}>
                    {JOB_CATEGORY_LABELS[category]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Results */}
          <div className="max-w-4xl mx-auto mb-6">
            <p className="text-sm text-muted-foreground">
              {filteredJobs.length}{" "}
              {filteredJobs.length === 1
                ? "serviço encontrado"
                : "serviços encontrados"}
            </p>
          </div>

          <div className="grid gap-6 max-w-4xl mx-auto">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <Card
                  key={job.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                            {JOB_CATEGORY_LABELS[job.category]}
                          </span>
                          <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">
                            {job.status === "open" ? "Aberto" : "Fechado"}
                          </span>
                        </div>
                        <CardTitle className="text-xl mb-2">
                          {job.title}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          📍 {job.location_text}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          R$ {job.value.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(job.created_at).toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {job.description}
                    </p>
                  </CardContent>

                  <CardFooter className="justify-end gap-3">
                    <Button variant="outline">Ver Detalhes</Button>
                    <Button>Candidatar-se</Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    Nenhum serviço encontrado com os filtros selecionados.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                    }}
                  >
                    Limpar Filtros
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="mt-8 text-center">
            <Button variant="outline" size="lg">
              Carregar Mais Serviços
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
