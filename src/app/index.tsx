import { Href, Redirect, router } from "expo-router";
import { useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Input } from "@/components/Input";
import { InputCodigo } from "@/components/InputCodigo";
import { Loader } from "@/components/Loader";
import { SeletorSegmentado } from "@/components/SeletorSegmentado";
import { Texto } from "@/components/Texto";

import { Cores, Espacamento, Raio } from "@/constants/tema";
import { useAutenticacao } from "@/contexts/AutenticacaoContext";
import {
  loginCuidador,
  loginPaciente,
  type Perfil,
} from "@/services/autenticacao";

const OPCOES_PERFIL = [
  { rotulo: "Sou cuidador", valor: "cuidador" },
  { rotulo: "Sou paciente", valor: "paciente" },
] as const;

export default function TelaLogin() {
  const { usuario, carregando, login } = useAutenticacao();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [perfil, setPerfil] = useState<Perfil>("cuidador");
  const [codigo, setCodigo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  const handleLogin = async (codigoCompleto?: string) => {
    if (enviando) return;

    setEnviando(true);
    setMensagemErro(null);

    try {
      const usuarioLogado =
        perfil === "cuidador"
          ? await loginCuidador({ email, senha })
          : await loginPaciente(codigoCompleto ?? codigo);

      await login(usuarioLogado);

      router.replace(
        (usuarioLogado.perfil === "cuidador"
          ? "/cuidador"
          : "/paciente") as Href,
      );
    } catch (erro) {
      setMensagemErro(
        erro instanceof Error ? erro.message : "Não foi possível login.",
      );
    } finally {
      setEnviando(false);
    }
  };

  const handleEsqueciSenha = () => {
    // TODO: navegar para o esqueci senha
  };

  const handleCriarConta = () => {
    // TODO: navegar para o cadastro
  };

  const handleMudarPerfil = (valor: Perfil) => {
    setPerfil(valor);

    setEmail("");
    setSenha("");
    setCodigo("");
    setMensagemErro(null);
  };

  if (carregando) {
    return (
      <View style={estilos.tela}>
        <Loader telaCheia />
      </View>
    );
  }

  if (usuario) {
    return (
      <Redirect
        href={
          (usuario.perfil === "cuidador" ? "/cuidador" : "/paciente") as Href
        }
      />
    );
  }

  return (
    <SafeAreaView style={estilos.areaSegura}>
      <View style={estilos.cabecalho}>
        <Image source={require("@/assets/logo.png")} style={estilos.logo} />
        <Texto tamanho="gg" peso="seminegrito">
          Bem-vindo a Zelo
        </Texto>
        <Texto tamanho="p" cor="textoSecundario" style={estilos.subtitulo}>
          Entre para acompanhar o tratamento de quem você cuida.
        </Texto>
      </View>

      <SeletorSegmentado
        opcoes={OPCOES_PERFIL}
        valor={perfil}
        onChange={handleMudarPerfil}
      />

      {perfil === "cuidador" ? (
        <View style={estilos.formulario}>
          <Input
            rotulo="E-mail"
            placeholder="seu@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            rotulo="Senha"
            placeholder="Digite sua senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />

          <Pressable onPress={handleEsqueciSenha} style={estilos.esqueci}>
            <Texto tamanho="pp" peso="seminegrito" cor="primaria">
              Esqueci minha senha
            </Texto>
          </Pressable>
        </View>
      ) : (
        <InputCodigo
          rotulo="Código do seu cuidador"
          ajuda="São 6 números."
          valor={codigo}
          onChange={setCodigo}
          onComplete={(codigoCompleto) => handleLogin(codigoCompleto)}
        />
      )}

      {mensagemErro && (
        <Texto
          tamanho="pp"
          cor="perigo"
          accessibilityRole="alert"
          style={estilos.erro}
        >
          {mensagemErro}
        </Texto>
      )}

      <TouchableOpacity
        style={estilos.botao}
        onPress={() => handleLogin()}
        disabled={enviando}
        activeOpacity={0.8}
        accessibilityRole="button"
      >
        <Texto peso="seminegrito" cor="sobrePrimaria" tamanho="p">
          Entrar
        </Texto>
      </TouchableOpacity>

      <Texto tamanho="pp" cor="textoSecundario" style={estilos.rodape}>
        {perfil === "cuidador" ? (
          <>
            Não tem uma conta?{" "}
            <Texto
              tamanho="pp"
              peso="seminegrito"
              cor="primaria"
              onPress={handleCriarConta}
            >
              Criar conta
            </Texto>
          </>
        ) : (
          "Não tem o código? Peça para quem cuida de você."
        )}
      </Texto>

      {enviando && <Loader telaCheia />}
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
  },
  areaSegura: {
    flex: 1,
    padding: Espacamento.quatro,
    gap: Espacamento.tres,
    justifyContent: "center",
  },
  cabecalho: {
    gap: Espacamento.dois,
    marginBottom: Espacamento.tres,
    alignItems: "center",
  },
  subtitulo: {
    textAlign: "center",
  },
  logo: {
    width: 56,
    height: 56,
  },
  formulario: {
    gap: Espacamento.tres,
  },
  esqueci: {
    alignSelf: "flex-end",
  },
  erro: {
    textAlign: "center",
  },
  botao: {
    height: 48,
    borderRadius: Raio.medio,
    backgroundColor: Cores.claro.primaria,
    alignItems: "center",
    justifyContent: "center",
  },
  rodape: {
    textAlign: "center",
  },
});
