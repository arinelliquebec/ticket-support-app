"use client";

import Link from "next/link";
import {
  LucideTicket,
  LucideClock,
  LucideArrowRight,
  LucideFileText,
  LucidePencil,
  LucideSparkles,
  LucideZap,
  LucideShield,
  LucideMessageSquare,
} from "lucide-react";
import { ticketsPath } from "@/paths";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { DashboardTicketSummary } from "@/features/ticket/components/dashboard-ticket-summary";
import { CreateTicketButton } from "@/features/ticket/components/create-ticket-button";

const HomePage = () => {
  const { data, isLoading, isError, refreshData } = useDashboardStats();

  return (
    <div className="flex-1 flex flex-col gap-y-12 max-w-7xl mx-auto w-full px-4 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl mt-4">
        {/* Background with gradient and pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent rounded-3xl" />
        <div className="absolute inset-0 cyber-grid-dots opacity-50" />

        {/* Floating elements with CSS animations */}
        <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-primary/10 blur-3xl animate-float" />
        <div className="absolute bottom-10 left-20 w-24 h-24 rounded-full bg-blue-500/10 blur-2xl animate-float" style={{ animationDelay: "1s" }} />

        <div className="relative px-8 py-16 md:px-12 md:py-20">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <LucideSparkles className="h-4 w-4" />
              <span>Sistema de Suporte Fradema</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 font-[family-name:var(--font-display)]">
              <span className="text-foreground">Bem-vindo ao </span>
              <span className="bg-gradient-to-r from-primary via-blue-400 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift">
                Suporte Fradema
              </span>
            </h1>

            {/* Description */}
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Plataforma moderna para gerenciar e acompanhar tickets de suporte
              com eficiência e agilidade.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button asChild variant="futuristic" size="lg">
                <Link href={ticketsPath()} className="flex items-center gap-2">
                  <LucideTicket className="h-5 w-5" />
                  Ver Tickets
                  <LucideArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <CreateTicketButton
                variant="outline"
                size="lg"
                className="border-primary/30 hover:bg-primary/10 hover:border-primary/50"
                label="Criar Novo Ticket"
              />
            </div>
          </div>

          {/* Decorative 3D Card - Desktop only */}
          <div className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2">
            <div className="relative w-64 h-80">
              {/* Stacked cards effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-500/20 border border-primary/20 transform rotate-6 translate-x-4 translate-y-4" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/30 to-blue-500/30 border border-primary/30 transform rotate-3 translate-x-2 translate-y-2" />
              <div className="relative h-full rounded-2xl bg-card/80 backdrop-blur-xl border border-primary/40 p-6 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                    <LucideZap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Suporte Rápido</h3>
                  <p className="text-sm text-muted-foreground">
                    Atendimento ágil e eficiente para suas demandas
                  </p>
                </div>
                <div className="flex items-center gap-2 text-primary text-sm font-medium">
                  <span>24/7</span>
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-1 rounded-full bg-gradient-to-b from-primary to-blue-500" />
          <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)]">
            Dashboard
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ticket Summary Component */}
          <DashboardTicketSummary />

          {/* Features Card */}
          <Card variant="glass" enableMotion={false}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 border border-primary/20">
                  <LucideShield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Sistema de Tickets</CardTitle>
                  <CardDescription>Funcionalidades principais</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <FeatureItem
                  title="Abertura de Tickets"
                  description="Crie e gerencie tickets de suporte facilmente"
                  icon={<LucideTicket className="h-5 w-5" />}
                />
                <FeatureItem
                  title="Acompanhamento"
                  description="Acompanhe o progresso de cada ticket em tempo real"
                  icon={<LucideClock className="h-5 w-5" />}
                />
                <FeatureItem
                  title="Edição Flexível"
                  description="Edite e atualize informações quando necessário"
                  icon={<LucidePencil className="h-5 w-5" />}
                />
                <FeatureItem
                  title="Anexos e Arquivos"
                  description="Envie documentos e imagens para melhor contextualização"
                  icon={<LucideFileText className="h-5 w-5" />}
                />
              </div>
            </CardContent>
            <CardFooter className="mt-4">
              <Button asChild variant="outline" className="w-full group">
                <Link href={ticketsPath()} className="flex items-center justify-center gap-2">
                  <span>Começar Agora</span>
                  <LucideArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Start CTA */}
        <Card variant="glass" enableMotion={false} className="relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <CardContent className="p-6">
            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                  <LucideMessageSquare className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1.5">Pronto para começar?</h3>
                  <p className="text-muted-foreground text-sm">
                    Abra seus tickets e forneça o máximo de informações para um atendimento eficaz.
                  </p>
                </div>
              </div>
              <Button asChild variant="futuristic" className="shrink-0">
                <Link href={ticketsPath()} className="flex items-center gap-2">
                  Ir para Tickets
                  <LucideArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Credits */}
        <Card variant="glass" enableMotion={false} className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl" />

          <CardContent className="p-6">
            <div className="relative flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 border border-primary/20">
                <LucideSparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-1.5 font-[family-name:var(--font-display)]">
                  Desenvolvimento Fradema
                </h3>
                <p className="text-muted-foreground text-sm">
                  Desenvolvido por equipe de Desenvolvimento Fradema @ 2025
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

// Feature Item Component - Simple CSS transitions
interface FeatureItemProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const FeatureItem = ({ title, description, icon }: FeatureItemProps) => (
  <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-primary/5 transition-all duration-300 hover:translate-x-1 group">
    <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 group-hover:border-primary/30 transition-colors">
      <span className="text-primary">{icon}</span>
    </div>
    <div>
      <h3 className="font-medium mb-0.5">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

export default HomePage;
