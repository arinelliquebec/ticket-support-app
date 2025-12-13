// Salve este código em: setup-buckets.js (na raiz do projeto)
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// Obter variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Usar service role key

// Verificar variáveis de ambiente
if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Variáveis de ambiente não encontradas!");
  console.log("Por favor, crie um arquivo .env com:");
  console.log("NEXT_PUBLIC_SUPABASE_URL=sua-url");
  console.log("SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key");
  process.exit(1);
}

// Criar cliente Supabase com service role key
console.log("🔄 Conectando ao Supabase com service role key...");
const supabase = createClient(supabaseUrl, serviceRoleKey);

// Criar buckets
async function setup() {
  try {
    // Verificar conexão
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
      throw new Error(`Erro ao conectar: ${error.message}`);
    }

    console.log(`✅ Conexão OK! ${data.length} buckets existentes`);

    // Criar bucket para anexos de tickets
    await createBucket("ticket-attachments", false);

    // Criar bucket para avatares
    await createBucket("avatars", true);

    console.log("\n🎉 CONFIGURAÇÃO CONCLUÍDA!");
    console.log("\nIMPORTANTE: Configure as políticas no painel do Supabase:");
    console.log("\nPara 'ticket-attachments':");
    console.log(
      "- Adicione política INSERT para role 'authenticated' (definition: true)"
    );
    console.log(
      "- Adicione política SELECT para role 'authenticated' (definition: true)"
    );
    console.log(
      "- Adicione política DELETE para role 'authenticated' (definition: true)"
    );

    console.log("\nPara 'avatars':");
    console.log(
      "- Adicione política INSERT para role 'authenticated' (definition: true)"
    );
    console.log(
      "- Adicione política SELECT para role 'anon' (definition: true)"
    );
  } catch (err) {
    console.error(`❌ ERRO: ${err.message}`);
  }
}

// Função para criar bucket
async function createBucket(name, isPublic) {
  console.log(`🔄 Configurando bucket "${name}"...`);

  // Verificar se já existe
  const { data, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    throw new Error(`Erro ao listar buckets: ${listError.message}`);
  }

  const exists = data.some((b) => b.name === name);

  if (exists) {
    console.log(`ℹ️ Bucket "${name}" já existe`);
  } else {
    // Criar bucket
    const { error } = await supabase.storage.createBucket(name, {
      public: isPublic,
    });

    if (error) {
      throw new Error(`Erro ao criar bucket: ${error.message}`);
    }

    console.log(`✅ Bucket "${name}" criado com sucesso!`);
  }
}

// Executar script
setup();
