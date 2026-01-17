import { Link } from 'react-router-dom';

function TermsOfUse() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo_monitora.png" alt="MonitoraPreço" className="h-8 w-8 object-contain" />
            <span className="text-xl font-bold text-gray-800">MonitoraPreço</span>
          </Link>
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Voltar ao início
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Termos de Uso
          </h1>
          <p className="text-gray-500 mb-8">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>

          <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                1. Aceitação dos Termos
              </h2>
              <p>
                Ao acessar ou usar o <strong>MonitoraPreço</strong> ("Serviço"), você concorda 
                em cumprir estes Termos de Uso. Se você não concordar com qualquer parte dos 
                termos, não poderá acessar o Serviço.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                2. Descrição do Serviço
              </h2>
              <p>
                O MonitoraPreço é uma plataforma que permite aos usuários:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Monitorar preços de produtos do Mercado Livre</li>
                <li>Receber alertas de queda de preço por e-mail</li>
                <li>Visualizar histórico de variação de preços</li>
                <li>Definir preços-alvo para notificações</li>
              </ul>
              <p className="mt-2">
                O Serviço utiliza a API oficial do Mercado Livre para obter informações 
                de produtos de forma autorizada.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                3. Cadastro e Conta
              </h2>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                3.1 Requisitos:
              </h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Você deve ter pelo menos 18 anos para criar uma conta</li>
                <li>É necessário fornecer informações verdadeiras e atualizadas</li>
                <li>Você é responsável por manter a segurança da sua conta</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-700 mb-2 mt-4">
                3.2 Responsabilidades:
              </h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Não compartilhar suas credenciais de acesso</li>
                <li>Notificar imediatamente sobre uso não autorizado</li>
                <li>Manter seu e-mail atualizado para receber notificações</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                4. Uso Aceitável
              </h2>
              <p>Ao usar nosso Serviço, você concorda em <strong>NÃO</strong>:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Usar o Serviço para fins ilegais ou não autorizados</li>
                <li>Tentar acessar áreas restritas do sistema</li>
                <li>Sobrecarregar nossos servidores com requisições excessivas</li>
                <li>Usar bots, scrapers ou automações não autorizadas</li>
                <li>Revender ou redistribuir o Serviço sem permissão</li>
                <li>Violar os termos de uso do Mercado Livre</li>
                <li>Interferir no funcionamento do Serviço</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                5. Limitações do Serviço
              </h2>
              <p>O MonitoraPreço:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <strong>Não garante</strong> a precisão absoluta dos preços exibidos, 
                  pois dependem da API do Mercado Livre
                </li>
                <li>
                  <strong>Não é responsável</strong> por decisões de compra baseadas 
                  em informações do Serviço
                </li>
                <li>
                  <strong>Não tem vínculo</strong> comercial ou de parceria com o 
                  Mercado Livre
                </li>
                <li>
                  <strong>Pode ter interrupções</strong> para manutenção ou por 
                  fatores externos
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                6. Planos e Pagamentos
              </h2>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                6.1 Plano Gratuito:
              </h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Monitoramento de até 5 produtos</li>
                <li>Atualização a cada 30 minutos</li>
                <li>Notificações por e-mail</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-700 mb-2 mt-4">
                6.2 Planos Pagos (quando disponíveis):
              </h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Limites expandidos de produtos</li>
                <li>Intervalos menores de atualização</li>
                <li>Recursos adicionais</li>
              </ul>
              <p className="mt-2">
                Os valores e condições dos planos pagos serão informados na contratação.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                7. Propriedade Intelectual
              </h2>
              <p>
                Todo o conteúdo do MonitoraPreço, incluindo mas não limitado a textos, 
                gráficos, logos, ícones, imagens, código-fonte e software, é propriedade 
                exclusiva do MonitoraPreço e está protegido pelas leis de propriedade 
                intelectual.
              </p>
              <p className="mt-2">
                "Mercado Livre" é marca registrada do MercadoLibre, Inc. O MonitoraPreço 
                não possui afiliação, parceria ou endosso do Mercado Livre.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                8. Isenção de Garantias
              </h2>
              <p>
                O Serviço é fornecido "como está" e "conforme disponível", sem garantias 
                de qualquer tipo, expressas ou implícitas, incluindo, mas não limitado a:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Garantias de comercialização</li>
                <li>Adequação a um propósito específico</li>
                <li>Não violação de direitos de terceiros</li>
                <li>Operação ininterrupta ou livre de erros</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                9. Limitação de Responsabilidade
              </h2>
              <p>
                Em nenhuma circunstância o MonitoraPreço, seus diretores, funcionários 
                ou afiliados serão responsáveis por:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Danos indiretos, incidentais ou consequenciais</li>
                <li>Perda de lucros, dados ou oportunidades de negócio</li>
                <li>Decisões de compra baseadas em informações do Serviço</li>
                <li>Interrupções ou indisponibilidade do Serviço</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                10. Rescisão
              </h2>
              <p>
                Podemos suspender ou encerrar seu acesso ao Serviço imediatamente, 
                sem aviso prévio, por qualquer motivo, incluindo, sem limitação, 
                violação destes Termos de Uso.
              </p>
              <p className="mt-2">
                Você pode encerrar sua conta a qualquer momento através das configurações 
                do perfil ou entrando em contato conosco.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                11. Alterações nos Termos
              </h2>
              <p>
                Reservamo-nos o direito de modificar estes Termos a qualquer momento. 
                Alterações significativas serão notificadas por e-mail ou através de 
                aviso no Serviço. O uso continuado após as alterações constitui 
                aceitação dos novos termos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                12. Legislação Aplicável
              </h2>
              <p>
                Estes Termos são regidos pelas leis da República Federativa do Brasil. 
                Qualquer disputa será submetida ao foro da comarca do domicílio do 
                usuário, conforme previsto no Código de Defesa do Consumidor.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                13. Contato
              </h2>
              <p>
                Para dúvidas sobre estes Termos de Uso, entre em contato:
              </p>
              <ul className="list-none pl-0 space-y-1 mt-2">
                <li>📧 E-mail: contato@monitorapreco.com.br</li>
                <li>🌐 Site: www.monitorapreco.com.br</li>
              </ul>
            </section>

            {/* Agreement Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
              <p className="text-blue-800 font-medium">
                ✅ Ao criar uma conta ou usar o MonitoraPreço, você confirma que leu, 
                entendeu e concorda com estes Termos de Uso e nossa{' '}
                <Link to="/privacy" className="text-blue-600 hover:underline">
                  Política de Privacidade
                </Link>.
              </p>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-12 pt-8 border-t border-gray-200 flex flex-wrap gap-4 justify-center">
            <Link
              to="/privacy"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Política de Privacidade
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              to="/"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Página Inicial
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} MonitoraPreço. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

export default TermsOfUse;
