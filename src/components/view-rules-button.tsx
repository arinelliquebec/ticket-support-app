// src/components/view-rules-button.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LucideInfo } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LucideCheckCircle,
  LucideAlertCircle,
  LucideFileText,
  LucideClock,
  LucideTag,
  LucideBuilding,
} from "lucide-react";

export function ViewRulesButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <LucideInfo className="h-4 w-4" />
        Ver Regras
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <LucideInfo className="h-6 w-6 text-primary" />
              Regras do Sistema de Tickets
            </DialogTitle>
            <DialogDescription>
              Diretrizes para uso do sistema de suporte
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[400px] w-full rounded-md border p-4">
            <div className="space-y-6">
              {/* Introdução */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary">
                  Sistema de Suporte Fradema
                </h3>
                <p className="text-sm text-muted-foreground">
                  Este sistema foi desenvolvido para facilitar o atendimento e
                  resolução de suas solicitações de suporte técnico. Para
                  garantir um atendimento eficiente, siga as orientações abaixo:
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
                      <strong>Título claro:</strong> Use um título descritivo
                      que resuma o problema (máx. 191 caracteres)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <LucideCheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">
                      <strong>Descrição detalhada:</strong> Forneça o máximo de
                      informações possível sobre o problema (máx. 1024
                      caracteres)
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
                      <strong>Filial:</strong> Identifique corretamente sua
                      filial para direcionamento adequado
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
                      Você pode adicionar comentários e anexos após criar o
                      ticket
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
                    <span className="font-medium text-blue-600">ABERTO:</span>{" "}
                    Seu ticket foi criado e está aguardando atendimento
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-amber-600">
                      EM ANDAMENTO:
                    </span>{" "}
                    A equipe de suporte está trabalhando na solução
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-green-600">
                      CONCLUÍDO:
                    </span>{" "}
                    O problema foi resolvido e o ticket foi fechado
                  </div>
                </div>
              </div>

              {/* Tempo de Resposta */}
              <div className="space-y-3">
                <h4 className="font-semibold">Tempo de Resposta</h4>
                <p className="text-sm text-muted-foreground ml-6">
                  Nossa equipe se esforça para responder todos os tickets no
                  menor tempo possível.
                </p>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button onClick={() => setIsOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
