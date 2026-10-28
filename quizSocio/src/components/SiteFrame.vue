<template>

    <video id="bg-video" autoplay muted loop playsinline preload="metadata" :poster="'./img/background.jpg'" aria-hidden="true">
        <source :src="'./img/2025_12_26_h264_9x16_CRUZEIRO JOGA JUNTO.mp4'" type="video/mp4">
    </video>
    <header class="cruzeiro" id="nav">
        <div class="info-header">
            <div class="contador">
                <div class="links"><a href="https://www.cruzeiro.com.br/"><img
                            src="https://socio.cruzeiro.com.br/packs/static/cruzeiro/images/icon-oficial-ab1c760e9a477f26ab6d.png"
                            alt="Ícone de site oficial">Site Oficial</a><a href="https://loja.cruzeiro.com.br/"><img
                            src="https://socio.cruzeiro.com.br/packs/static/cruzeiro/images/icon-loja-9ef84c1a2fcdf75c75f2.png"
                            alt="Ícone de loja">Loja</a></div>
            </div>
            <div class="sociais"><a href="https://www.facebook.com/cruzeirooficial" target="_blank"
                    rel="noopener noreferrer" title="facebook"><img
                        src="https://socio.cruzeiro.com.br/packs/static/cruzeiro/images/icon-social/facebook_icon-94e950311eb66faf3686.png"
                        alt="Ícone do Facebook"></a><a href="https://www.instagram.com/cruzeiro" target="_blank"
                    rel="noopener noreferrer" title="instagram"><img
                        src="https://socio.cruzeiro.com.br/packs/static/cruzeiro/images/icon-social/instagram_icon-975c4138b57629c0b3f3.png"
                        alt="Ícone do Instagram"></a><a href="https://x.com/cruzeiro" target="_blank"
                    rel="noopener noreferrer" title="twitter"><img
                        src="https://socio.cruzeiro.com.br/packs/static/cruzeiro/images/icon-social/x_icon-0cb02697682b758664e4.png"
                        alt="Ícone do X"></a><a href="https://www.tiktok.com/@cruzeiro" target="_blank"
                    rel="noopener noreferrer" title="tiktok"><img
                        src="https://socio.cruzeiro.com.br/packs/static/cruzeiro/images/icon-social/tiktok_icon-302b8bad23fca898a772.png"
                        alt="Ícone do TikTok"></a><a href="https://www.youtube.com/user/oficialcruzeiro" target="_blank"
                    rel="noopener noreferrer" title="youtube"><img
                        src="https://socio.cruzeiro.com.br/packs/static/cruzeiro/images/icon-social/youtube_icon-845711630bb5a2bd015c.png"
                        alt="Ícone do YouTube"></a>
            </div>
        </div>
        <div class="main-header">
            <div class="menu" :class="{ open: menuOpen }" id="headerMenu"><a href="https://socio.cruzeiro.com.br/">INÍCIO</a><a
                    href="https://socio.cruzeiro.com.br/planos">PLANOS</a><a
                    href="https://socio.cruzeiro.com.br/jogos">PRÓXIMOS JOGOS</a><a
                    href="https://socio.cruzeiro.com.br/duvidas">DÚVIDAS</a></div>
            <div class="mobile">
                <button class="nav-toggle" :class="{ active: menuOpen }" type="button" :aria-label="menuOpen ? 'Fechar menu' : 'Abrir menu'" aria-controls="headerMenu" :aria-expanded="String(menuOpen)" @click="menuOpen = !menuOpen"><span class="bar"></span><span class="bar"></span><span class="bar"></span></button>
            </div><a class="logo" href="https://socio.cruzeiro.com.br/" aria-label="Sócio 5 Estrelas — início"><img alt="Sócio 5 Estrelas"
                    src="https://socio.cruzeiro.com.br/packs/static/cruzeiro/images/logo-site-60f55ac6e5da9ad26583.png"></a>
            <div class="account-actions">
                <div class="navbar-user-section">
                    <a class="menu-button" href="https://socio.cruzeiro.com.br/minha-conta">
                        <span>MINHA CONTA</span>
                    </a>
                </div>
            </div>
        </div>
    </header>
    
<slot />
<footer id="rodape">
        <div class="container">
            <div class="logo"><a href="https://socio.cruzeiro.com.br/"><img
                        src="https://socio.cruzeiro.com.br/packs/static/cruzeiro/images/logo-rodape-4badfb6988b9a00780ab.svg"
                        alt="Cruzeiro logo" title="Cruzeiro logo"></a></div>
            <div class="redes-sociais"><a href="https://www.facebook.com/cruzeirooficial" rel="noopener noreferrer"
                    target="_blank"><img
                        src="https://socio.cruzeiro.com.br/packs/static/cruzeiro/images/icon-social/facebook_icon-48d8b35fd74ce4cd95cb.svg"
                        alt="Facebook" title="Facebook"></a><a href="https://www.instagram.com/cruzeiro"
                    rel="noopener noreferrer" target="_blank"><img
                        src="https://socio.cruzeiro.com.br/packs/static/cruzeiro/images/icon-social/instagram_icon-6b996608e02c1e84e224.svg"
                        alt="Instagram" title="Instagram"></a><a href="https://x.com/cruzeiro" rel="noopener noreferrer"
                    target="_blank"><img
                        src="https://socio.cruzeiro.com.br/packs/static/cruzeiro/images/icon-social/x_icon-e57d61853ba24e10f61b.svg"
                        alt="X" title="X"></a><a href="https://www.tiktok.com/@cruzeiro" rel="noopener noreferrer"
                    target="_blank"><img
                        src="https://socio.cruzeiro.com.br/packs/static/cruzeiro/images/icon-social/tiktok_icon-13ed59f7dad9ff5dd2ac.svg"
                        alt="TikTok" title="TikTok"></a><a href="https://www.youtube.com/user/oficialcruzeiro"
                    rel="noopener noreferrer" target="_blank"><img
                        src="https://socio.cruzeiro.com.br/packs/static/cruzeiro/images/icon-social/youtube_icon-9a510453dec45685082d.svg"
                        alt="YouTube" title="YouTube"></a></div>
            <div class="atendimento">
                <div>
                    <p>Telefone e WhatsApp: <a class="description"
                            href="https://api.whatsapp.com/send?phone=553140002161">31 4000-2161</a></p>
                </div>
                <div>
                    <p>E-mail: <a class="description"
                            href="mailto:socio5estrelas@cruzeiro.com.br">socio5estrelas@cruzeiro.com.br</a></p>
                </div>
                <div>
                    <p>Central de Relacionamento: <span class="description">08h00 às 18h00 - Seg. a Sex.</span></p>
                </div>
            </div>
        </div>
        <div class="container">
            <div class="termos"><span>© 2026 - CRUZEIRO ESPORTE CLUBE SAF</span>
                <div><a data-turbo-frame="frame-modal"
                        href="https://socio.cruzeiro.com.br/pt-BR/paginas/politica-de-privacidade">Política de
                        privacidade</a> | <a data-turbo-frame="frame-modal"
                        href="https://socio.cruzeiro.com.br/pt-BR/paginas/termo-de-uso">Termos de
                        uso</a> | <a data-turbo-frame="frame-modal"
                        href="https://socio.cruzeiro.com.br/pt-BR/paginas/termo-de-compra">Termo de
                        compra de ingressos</a></div>
            </div>
        </div>
    </footer>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
const menuOpen = ref(false);
function onEscape(event) {
    if (event.key === 'Escape' && menuOpen.value) {
        menuOpen.value = false;
        document.querySelector('.nav-toggle')?.focus();
    }
}
onMounted(() => document.addEventListener('keydown', onEscape));
onBeforeUnmount(() => document.removeEventListener('keydown', onEscape));
</script>
