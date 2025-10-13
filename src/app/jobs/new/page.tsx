"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown } from "lucide-react";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  jobCategoriesOptions,
  type NewJobFormData,
  newJobSchema,
} from "../schemas";
import { createJob } from "./actions";

export default function NewJobPage() {
  const [categoryOpen, setCategoryOpen] = useState(false);

  const newJobForm = useForm<NewJobFormData>({
    resolver: zodResolver(newJobSchema),
    defaultValues: {
      title: "",
      category: "painting",
      description: "",
      location: "",
      price: undefined,
    },
  });

  const onNewJobSubmit = async (data: NewJobFormData) => {
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("category", data.category);
      formData.append("description", data.description);
      formData.append("location", data.location);
      formData.append("price", data.price.toString());

      const result = await createJob(formData);

      if (result?.error) {
        newJobForm.setError("root", {
          type: "manual",
          message: result.error,
        });
      }
    } catch (error) {
      if (isRedirectError(error)) {
        throw error;
      }
      newJobForm.setError("root", {
        type: "manual",
        message: "Ocorreu um erro inesperado. Tente novamente.",
      });
    }
  };

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <h1 className="mb-6 text-3xl font-bold">Criar Novo Serviço</h1>

      <form
        onSubmit={newJobForm.handleSubmit(onNewJobSubmit)}
        className="flex flex-col gap-6"
      >
        {/* Card 1: Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>
              Preencha as informações principais sobre o serviço
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="gap-0.5">
              {/* Título */}
              <Field>
                <FieldLabel htmlFor="title">Título</FieldLabel>
                <Controller
                  name="title"
                  control={newJobForm.control}
                  render={({ field }) => (
                    <Input
                      id="title"
                      placeholder="Ex: Pintura de sala de estar"
                      {...field}
                    />
                  )}
                />
                <FieldError errors={[newJobForm.formState.errors.title]} />
              </Field>

              {/* Category */}
              <Field>
                <FieldLabel>Categoria</FieldLabel>
                <Controller
                  name="category"
                  control={newJobForm.control}
                  render={({ field }) => (
                    <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={categoryOpen}
                          className="w-full justify-between"
                        >
                          {field.value
                            ? jobCategoriesOptions.find(
                                (category) => category.value === field.value,
                              )?.label
                            : "Selecione uma categoria..."}
                          <ChevronsUpDown />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                        <Command>
                          <CommandInput placeholder="Buscar categoria..." />
                          <CommandList>
                            <CommandEmpty>
                              Nenhuma categoria encontrada.
                            </CommandEmpty>
                            <CommandGroup>
                              {jobCategoriesOptions.map((category) => (
                                <CommandItem
                                  key={category.value}
                                  value={category.value}
                                  onSelect={(currentValue) => {
                                    field.onChange(
                                      currentValue === field.value
                                        ? ""
                                        : currentValue,
                                    );
                                    setCategoryOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value === category.value
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  {category.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                />
                <FieldError errors={[newJobForm.formState.errors.category]} />
              </Field>

              {/* Description */}
              <Field>
                <FieldLabel htmlFor="description">Descrição</FieldLabel>
                <Controller
                  name="description"
                  control={newJobForm.control}
                  render={({ field }) => (
                    <Textarea
                      id="description"
                      placeholder="Descreva os detalhes do serviço..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  )}
                />
                <FieldError
                  errors={[newJobForm.formState.errors.description]}
                />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Card 2: Location */}
        <Card>
          <CardHeader>
            <CardTitle>Localização</CardTitle>
            <CardDescription>Onde o serviço será realizado?</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="location">Localização</FieldLabel>
                <Controller
                  name="location"
                  control={newJobForm.control}
                  render={({ field }) => (
                    <Input
                      id="location"
                      placeholder="Ex: Rua das Flores, 123 - Centro"
                      {...field}
                    />
                  )}
                />
                <FieldError errors={[newJobForm.formState.errors.location]} />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Card 3: Value */}
        <Card>
          <CardHeader>
            <CardTitle>Valor</CardTitle>
            <CardDescription>
              Qual o valor estimado para o serviço?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="price">Preço (R$)</FieldLabel>
                <Controller
                  name="price"
                  control={newJobForm.control}
                  render={({ field: { value, onChange, ...field } }) => (
                    <Input
                      id="price"
                      type="number"
                      placeholder="0.00"
                      step="any"
                      min="0"
                      {...field}
                      value={value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        onChange(
                          val === "" ? undefined : Number.parseFloat(val),
                        );
                      }}
                    />
                  )}
                />
                <FieldError errors={[newJobForm.formState.errors.price]} />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline">
            Cancelar
          </Button>
          <Button type="submit">Criar Serviço</Button>
        </div>

        {/* General form error */}
        {newJobForm.formState.errors.root && (
          <FieldError errors={[newJobForm.formState.errors.root]} />
        )}
      </form>
    </div>
  );
}
