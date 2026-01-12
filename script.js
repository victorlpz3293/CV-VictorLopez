import { GoogleGenerativeAI } from 'https://esm.run/@google/generative-ai';

// --- CONFIGURACIÓN ---
const API_KEY = "AIzaSyCe0lnTHIHyGwYjOXfkDJrZdEH9crWQPto"; 
let bookInstance = null;
let genAI = null;
let model = null;

// Inicializar la IA
try {
    if(API_KEY) {
        genAI = new GoogleGenerativeAI(API_KEY);
        model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025" });
    }
} catch (error) {
    console.warn("IA no disponible, iniciando modo local.");
}

// Contexto Real para la IA
const CONTEXTO_CV = `
CANDIDATO: Victor R. Lopez. Ingeniero en Telemática (UNAN, 4to año). IT Manager en Kaitai Nicaragua.
EXPERIENCIA: +6 años. Oficial TI (Mega Comunicaciones), Soporte (Hermoso y Vigil, IPESA).
HARD SKILLS: Virtualización (VMWare/Proxmox), Windows Server, Linux, Cisco CCNA, Hacking Ético, Soporte L3.
CONTACTO: victorlpz3293@gmail.com, +505 8133-6115.
UBICACIÓN: Ciudad Sandino, Managua.
`;

// --- INICIALIZACIÓN DEL LIBRO ---
document.addEventListener('DOMContentLoaded', () => {
    const bookElement = document.getElementById('book');
    bookInstance = new St.PageFlip(bookElement, {
        width: 450,
        height: 650,
        size: 'stretch',
        minWidth: 350,
        maxWidth: 550,
        minHeight: 500,
        maxHeight: 800,
        maxShadowOpacity: 0.8,
        showCover: true,
        mobileScrollSupport: false,
        startPage: 0
    });
    bookInstance.loadFromHTML(document.querySelectorAll('.page'));
});

// --- CHATBOT INTELIGENTE (HÍBRIDO) ---
const chatWindow = document.getElementById('chat-window');
const chatInput = document.getElementById('chat-input');
const msgsDiv = document.getElementById('chat-messages');

document.getElementById('toggle-chat').addEventListener('click', () => {
    chatWindow.classList.toggle('hidden');
    chatWindow.classList.toggle('flex');
    if(!chatWindow.classList.contains('hidden')) chatInput.focus();
});

document.getElementById('close-chat').addEventListener('click', () => {
    chatWindow.classList.add('hidden');
    chatWindow.classList.remove('flex');
});

document.getElementById('send-chat').addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') sendMessage(); });

async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    addMsg(text, 'user-msg');
    chatInput.value = '';
    const loadId = addMsg('Pensando...', 'ai-msg animate-pulse');
    
    try {
        if (!model) throw new Error("Sin modelo");
        
        // 1. INTENTO CON IA REAL
        const prompt = `Eres el asistente de Victor Lopez. Responde brevemente (max 30 palabras) a: "${text}". Contexto: ${CONTEXTO_CV}`;
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        
        document.getElementById(loadId).remove();
        addMsg(formatText(response), 'ai-msg');

    } catch (e) {
        // 2. SI FALLA LA IA, USA EL CEREBRO LOCAL (RESPALDO INTELIGENTE)
        document.getElementById(loadId).remove();
        const respuestaLocal = cerebroLocal(text.toLowerCase());
        addMsg(respuestaLocal, 'ai-msg');
    }
}

// --- CEREBRO LOCAL (Respaldo inteligente sin internet/API) ---
function cerebroLocal(pregunta) {
    if (pregunta.includes('contacto') || pregunta.includes('correo') || pregunta.includes('celular') || pregunta.includes('llamar')) {
        return "Puedes contactar a Victor al <b>+505 8133-6115</b> o escribir a <b>victorlpz3293@gmail.com</b>.";
    }
    
    if (pregunta.includes('donde') || pregunta.includes('vive') || pregunta.includes('ubicacion')) {
        return "Victor reside actualmente en <b>Ciudad Sandino, Managua</b>.";
    }

    if (pregunta.includes('trabaja') || pregunta.includes('actual') || pregunta.includes('empresa') || pregunta.includes('ahora')) {
        return "Actualmente es <b>Responsable de TI en Kaitai Nicaragua S.A.</b> (desde Sept 2025).";
    }

    if (pregunta.includes('experiencia') || pregunta.includes('trabajo') || pregunta.includes('trayectoria')) {
        return "Tiene <b>+6 años de experiencia</b>. Ha trabajado en Kaitai, Mega Comunicaciones, Hermoso y Vigil e IPESA.";
    }
    
    if (pregunta.includes('estudios') || pregunta.includes('universidad') || pregunta.includes('titulo') || pregunta.includes('carrera')) {
        return "Estudia <b>Ingeniería en Telemática</b> (3er año) en la UNAN-Managua y es Técnico Medio en Computación.";
    }
    
    if (pregunta.includes('habilidades') || pregunta.includes('sabe') || pregunta.includes('tecnologias') || pregunta.includes('skills')) {
        return "Domina <b>Virtualización (VMWare/Proxmox)</b>, Windows Server, Linux, Redes Cisco/Mikrotik y Ciberseguridad.";
    }
    
    if (pregunta.includes('hola') || pregunta.includes('buenos')) {
        return "¡Hola! Soy el asistente virtual. Pregúntame sobre la experiencia o habilidades de Victor.";
    }
    
    return "Victor es un profesional TI con experiencia en Infraestructura y Redes. ¿Te gustaría saber sobre su <b>Experiencia</b> o <b>Contacto</b>?";
}

function addMsg(html, cssClass) {
    const div = document.createElement('div');
    div.className = cssClass;
    div.innerHTML = html;
    msgsDiv.appendChild(div);
    msgsDiv.scrollTop = msgsDiv.scrollHeight;
    return div.id = 'msg-' + Date.now();
}

function formatText(text) { return text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>'); }

// --- GENERADOR DE CARTA ---
const modal = document.getElementById('modal-overlay');
const modalContent = document.getElementById('modal-content');
const btnCover = document.getElementById('btn-cover-letter');

// Carta de Respaldo Fija
const CARTA_RESPALDO = `Estimado(a) Gerente de Selección,

Es un placer presentar mi candidatura para la vacante que tiene disponible en areas de TI.

Con más de 6 años de experiencia técnica y mi rol actual liderando el departamento de TI en Kaitai Nicaragua S.A., he desarrollado una capacidad única para alinear la infraestructura tecnológica con los objetivos críticos del negocio.

Mi trayectoria incluye la administración experta de entornos virtualizados (VMWare ESXi y ProxmoxVE), la gestión de seguridad en redes corporativas y el liderazgo de equipos de soporte técnico.

Estoy listo para llevar su infraestructura tecnológica al siguiente nivel de eficiencia y seguridad.

Atentamente,

Victor R. Lopez
Ingeniero en Telemática & IT Manager
+505 8133-6115 | victorlpz3293@gmail.com`;

if(btnCover) {
    btnCover.addEventListener('click', async () => {
        const originalText = btnCover.innerHTML;
        btnCover.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Redactando...';
        btnCover.disabled = true;
        
        try {
            if (!model) throw new Error("Forzar respaldo");
            const prompt = `Escribe una Carta de Presentación breve y profesional para Victor Lopez. Contexto: ${CONTEXTO_CV}`;
            const result = await model.generateContent(prompt);
            modalContent.innerText = result.response.text();
        } catch (e) {
            await new Promise(r => setTimeout(r, 1000));
            modalContent.innerText = CARTA_RESPALDO;
        } finally {
            modal.classList.remove('hidden');
            btnCover.innerHTML = originalText;
            btnCover.disabled = false;
        }
    });
}

window.closeModal = () => modal.classList.add('hidden');
window.copyText = () => navigator.clipboard.writeText(modalContent.innerText).then(() => alert("Copiado"));

// --- FUNCIÓN PARA DESCARGAR LA CARTA COMO PDF ---
window.downloadPDF = function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const text = document.getElementById('modal-content').innerText;
    const marginLeft = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxLineWidth = pageWidth - (marginLeft * 2);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(30, 58, 138);
    doc.text("Victor R. Lopez", marginLeft, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Ingeniero en Telemática & IT Manager", marginLeft, 26);
    doc.text("victorlpz3293@gmail.com | +505 8133-6115", marginLeft, 31);
    doc.setDrawColor(200);
    doc.line(marginLeft, 36, pageWidth - marginLeft, 36);

    doc.setFont("times", "normal");
    doc.setFontSize(12);
    doc.setTextColor(0);
    const splitText = doc.splitTextToSize(text, maxLineWidth);
    doc.text(splitText, marginLeft, 45);

    doc.save("Carta_Presentacion_Victor_Lopez.pdf");
}
