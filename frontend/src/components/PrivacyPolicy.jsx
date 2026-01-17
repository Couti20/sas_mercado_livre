import { Link } from 'react-router-dom';

function PrivacyPolicy() {
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
            Política de Privacidade
          </h1>
          <p className="text-gray-500 mb-8">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>

          <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                1. Introdução
              </h2>
              <p>
                O <strong>MonitoraPreço</strong> ("nós", "nosso" ou "Aplicativo") está comprometido 
                em proteger sua privacidade. Esta Política de Privacidade explica como coletamos, 
                usamos, armazenamos e protegemos suas informações pessoais quando você utiliza 
                nosso serviço de monitoramento de preços do Mercado Livre.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                2. Informações que Coletamos
              </h2>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                2.1 Informações fornecidas por você:
              </h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Nome completo</li>
                <li>Endereço de e-mail</li>
                <li>Senha (armazenada de forma criptografada)</li>
                <li>Preferências de notificação</li>
                <li>URLs de produtos que você deseja monitorar</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-700 mb-2 mt-4">
                2.2 Informações coletadas automaticamente:
              </h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Dados de preço e disponibilidade dos produtos monitorados</li>
                <li>Histórico de variação de preços</li>
                <li>Data e hora de acesso ao serviço</li>
                <li>Informações do dispositivo e navegador</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-700 mb-2 mt-4">
                2.3 Informações da API do Mercado Livre:
              </h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Dados públicos de produtos (título, preço, imagem)</li>
                <li>Token de acesso OAuth (para consultas autorizadas)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                3. Como Usamos suas Informações
              </h2>
              <p>Utilizamos suas informações para:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Criar e gerenciar sua conta de usuário</li>
                <li>Monitorar os preços dos produtos que você adicionou</li>
                <li>Enviar notificações de queda de preço por e-mail</li>
                <li>Gerar histórico e gráficos de variação de preços</li>
                <li>Melhorar nossos serviços e experiência do usuário</li>
                <li>Enviar comunicações importantes sobre sua conta</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                4. Compartilhamento de Dados
              </h2>
              <p>
                <strong>Não vendemos, alugamos ou compartilhamos</strong> suas informações 
                pessoais com terceiros para fins de marketing.
              </p>
              <p className="mt-2">Podemos compartilhar dados apenas:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Com provedores de serviço essenciais (hospedagem, e-mail)</li>
                <li>Quando exigido por lei ou ordem judicial</li>
                <li>Para proteger nossos direitos legais</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                5. Segurança dos Dados
              </h2>
              <p>Implementamos medidas de segurança para proteger suas informações:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Senhas criptografadas com BCrypt</li>
                <li>Comunicação via HTTPS (SSL/TLS)</li>
                <li>Tokens JWT com expiração</li>
                <li>Acesso restrito ao banco de dados</li>
                <li>Monitoramento de atividades suspeitas</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                6. Seus Direitos (LGPD)
              </h2>
              <p>
                De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Acesso:</strong> Solicitar cópia dos seus dados pessoais</li>
                <li><strong>Correção:</strong> Corrigir dados incompletos ou incorretos</li>
                <li><strong>Exclusão:</strong> Solicitar a exclusão dos seus dados</li>
                <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
                <li><strong>Revogação:</strong> Retirar consentimento a qualquer momento</li>
              </ul>
              <p className="mt-2">
                Para exercer seus direitos, entre em contato pelo e-mail: {' '}
                <a href="mailto:contato@monitorapreco.com.br" className="text-blue-600 hover:underline">
                  contato@monitorapreco.com.br
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                7. Retenção de Dados
              </h2>
              <p>
                Mantemos suas informações enquanto sua conta estiver ativa. Ao solicitar 
                exclusão da conta, seus dados pessoais serão removidos em até 30 dias, 
                exceto quando a retenção for necessária para cumprimento de obrigações legais.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                8. Cookies
              </h2>
              <p>
                Utilizamos cookies e tecnologias similares para manter sua sessão ativa 
                e melhorar sua experiência. Você pode configurar seu navegador para 
                recusar cookies, mas isso pode afetar a funcionalidade do serviço.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                9. Alterações nesta Política
              </h2>
              <p>
                Podemos atualizar esta Política periodicamente. Notificaremos sobre 
                mudanças significativas por e-mail ou através de aviso no Aplicativo. 
                O uso continuado do serviço após as alterações constitui aceitação da 
                política revisada.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                10. Contato
              </h2>
              <p>
                Se tiver dúvidas sobre esta Política de Privacidade, entre em contato:
              </p>
              <ul className="list-none pl-0 space-y-1 mt-2">
                <li>📧 E-mail: contato@monitorapreco.com.br</li>
                <li>🌐 Site: www.monitorapreco.com.br</li>
              </ul>
            </section>
          </div>

          {/* Footer Links */}
          <div className="mt-12 pt-8 border-t border-gray-200 flex flex-wrap gap-4 justify-center">
            <Link
              to="/terms"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Termos de Uso
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

export default PrivacyPolicy;
