// src/components/ticket-rules-popup.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LucideInfo,
  LucideCheckCircle,
  LucideAlertCircle,
  LucideFileText,
  LucideClock,
  LucideTag,
  LucideBuilding,
} from "lucide-react";

const STORAGE_KEY = "ticket-rules-viewed";

export function TicketRulesPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Verificar se é o primeiro acesso
    const hasViewedRules = localStorage.getItem(STORAGE_KEY);

    if (!hasViewedRules) {
      // Pequeno delay para garantir que a página carregou
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    // Marcar como visualizado
    localStorage.setItem(STORAGE_KEY, "true");
    setIsOpen(false);
  };

  const handleAccept = () => {
    // Marcar como visualizado e aceito
    localStorage.setItem(STORAGE_KEY, "true");
    localStorage.setItem(`${STORAGE_KEY}-accepted`, new Date().toISOString());
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <LucideInfo className="h-6 w-6 text-primary" />
            Regras do Sistema de Tickets
          </DialogTitle>
          <DialogDescription>
            Por favor, leia atentamente as regras antes de criar seus tickets
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
          <div className="space-y-6">
            {/* Introdução */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary">
                Bem-vindo ao Sistema de Suporte Fradema!
              </h3>
              <p className="text-sm text-muted-foreground">
                Este sistema foi desenvolvido para facilitar o atendimento e
                resolução de suas solicitações de suporte técnico. Para garantir
                um atendimento eficiente, siga as orientações abaixo:
              </p>
            </div>

            {/* Regras de Criação */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <LucideFileText className="h-5 w-5 text-blue-500" />
                Ao Criar um Ticket
              </h4>
              <ul className="space-y-2 ml-6">
                <li className="flex items-start gap-2">
                  <LucideCheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">
                    <strong>Título claro:</strong> Use um título descritivo que
                    resuma o problema (máx. 191 caracteres)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <LucideCheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">
                    <strong>Descrição detalhada:</strong> Forneça o máximo de
                    informações possível sobre o problema (máx. 1024 caracteres)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <LucideTag className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">
                    <strong>Categoria correta:</strong> Selecione a categoria
                    que melhor se adequa ao seu problema
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <LucideBuilding className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">
                    <strong>Filial:</strong> Identifique corretamente sua filial
                    para direcionamento adequado
                  </span>
                </li>
              </ul>
            </div>

            {/* Informações Importantes */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <LucideAlertCircle className="h-5 w-5 text-amber-500" />
                Informações Importantes
              </h4>
              <ul className="space-y-2 ml-6">
                <li className="flex items-start gap-2">
                  <span className="text-sm text-amber-600">•</span>
                  <span className="text-sm">
                    Inclua capturas de tela, mensagens de erro ou qualquer
                    informação que possa ajudar na resolução
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sm text-amber-600">•</span>
                  <span className="text-sm">
                    Evite criar múltiplos tickets para o mesmo problema
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sm text-amber-600">•</span>
                  <span className="text-sm">
                    Você pode adicionar comentários e anexos após criar o ticket
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sm text-amber-600">•</span>
                  <span className="text-sm">
                    Acompanhe o status do seu ticket regularmente
                  </span>
                </li>
              </ul>
            </div>

            {/* Status dos Tickets */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <LucideClock className="h-5 w-5 text-green-500" />
                Status dos Tickets
              </h4>
              <div className="space-y-2 ml-6">
                <div className="text-sm">
                  <span className="font-medium text-blue-600">ABERTO:</span> Seu
                  ticket foi criado e está aguardando atendimento
                </div>
                <div className="text-sm">
                  <span className="font-medium text-amber-600">
                    EM ANDAMENTO:
                  </span>{" "}
                  A equipe de suporte está trabalhando na solução
                </div>
                <div className="text-sm">
                  <span className="font-medium text-green-600">CONCLUÍDO:</span>{" "}
                  O problema foi resolvido e o ticket foi fechado
                </div>
              </div>
            </div>

            {/* Tempo de Resposta */}
            <div className="space-y-3">
              <h4 className="font-semibold">Tempo de Resposta</h4>
              <p className="text-sm text-muted-foreground ml-6">
                Nossa equipe se esforça para responder todos os tickets no menor
                tempo possível.
              </p>
            </div>

            {/* Contato */}
            <div className="space-y-3 border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Ao utilizar este sistema, você concorda em seguir estas
                diretrizes. O não cumprimento pode resultar em atrasos no
                atendimento.
              </p>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-auto"
          >
            Fechar
          </Button>
          <Button onClick={handleAccept} className="w-full sm:w-auto">
            Li e Aceito as Regras
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
