import { GoogleGenerativeAI } from 'https://esm.run/@google/generative-ai';

// --- CONFIGURACIÓN ---
const API_KEY = "AIzaSyCe0lnTHIHyGwYjOXfkDJrZdEH9crWQPto"; 
let bookInstance = null;
let genAI = null;
let model = null;

// Inicializar la IA (Protegido contra errores)
try {
    if(API_KEY) {
        genAI = new GoogleGenerativeAI(API_KEY);
        model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025" });
    }
} catch (error) {
    console.warn("La IA no pudo iniciarse, se usará el modo respaldo.");
}

// Contexto Real para la IA
const CONTEXTO_CV = `
CANDIDATO: Victor R. Lopez. Ingeniero en Telemática (UNAN, 4to año). IT Manager en Kaitai Nicaragua.
EXPERIENCIA: +6 años. Oficial TI (Mega Comunicaciones), Soporte (Hermoso y Vigil, IPESA).
HARD SKILLS: Virtualización (VMWare/Proxmox), Windows Server, Linux, Cisco CCNA, Hacking Ético, Soporte L3.
`;

// Carta de Respaldo (Por si la IA falla)
const CARTA_RESPALDO = `Estimado(a) Gerente de Selección,

Es un placer presentar mi candidatura para la posición de Responsable de TI / Administrador de Sistemas.

Con más de 6 años de experiencia técnica y mi rol actual liderando el departamento de TI en Kaitai Nicaragua S.A., he desarrollado una capacidad única para alinear la infraestructura tecnológica con los objetivos críticos del negocio.

Mi trayectoria incluye la administración experta de entornos virtualizados (VMWare ESXi y ProxmoxVE), la gestión de seguridad en redes corporativas y el liderazgo de equipos de soporte técnico. En mi experiencia previa en Mega Comunicaciones, logré optimizar la disponibilidad de los servicios reduciendo drásticamente los tiempos de inactividad.

¿Qué puedo aportar a su equipo?
1. Visión Integral: Combino conocimientos de ingeniería en telemática con gestión operativa real.
2. Solidez Técnica: Domino desde el cableado estructurado hasta la configuración avanzada de servidores Windows/Linux.
3. Enfoque en Seguridad: Cuento con certificaciones en Hacking Ético y Análisis Forense, garantizando una infraestructura protegida.

Estoy listo para llevar su infraestructura tecnológica al siguiente nivel de eficiencia y seguridad.

Atentamente,

Victor R. Lopez
Ingeniero en Telemática & IT Manager
+505 8133-6115 | victorlpz3293@gmail.com`;

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

// --- CHATBOT (Híbrido: IA + Respuestas Rápidas) ---
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
        // Intentar con IA Real
        const prompt = `Eres el asistente de Victor Lopez. Responde brevemente (max 40 palabras) a: "${text}". Contexto: ${CONTEXTO_CV}`;
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        
        document.getElementById(loadId).remove();
        addMsg(formatText(response), 'ai-msg');
    } catch (e) {
        // Fallback si la IA falla (Respuestas predefinidas)
        document.getElementById(loadId).remove();
        let resp = "Victor tiene +6 años de experiencia en TI, virtualización y redes. Contacto: victorlpz3293@gmail.com";
        if(text.toLowerCase().includes("hola")) resp = "¡Hola! Soy el asistente virtual de Victor. ¿En qué puedo ayudarte?";
        addMsg(resp, 'ai-msg');
    }
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

// --- GENERADOR DE CARTA (ROBUSTO) ---
const modal = document.getElementById('modal-overlay');
const modalContent = document.getElementById('modal-content');
const btnCover = document.getElementById('btn-cover-letter');

if(btnCover) {
    btnCover.addEventListener('click', async () => {
        const originalText = btnCover.innerHTML;
        btnCover.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Redactando...';
        btnCover.disabled = true;
        
        try {
            if (!model) throw new Error("Simular error para usar respaldo");
            
            // Intentar IA Real
            const prompt = `Escribe una Carta de Presentación profesional para Victor Lopez dirigida a RRHH. Usa el contexto: ${CONTEXTO_CV}. Sin saludos ni fechas, solo cuerpo.`;
            const result = await model.generateContent(prompt);
            modalContent.innerText = result.response.text();
            
        } catch (e) {
            console.log("Usando carta de respaldo...");
            // Si falla, usar carta pre-escrita (Simulando carga)
            await new Promise(r => setTimeout(r, 1500)); 
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

// --- GENERADOR PDF ---
window.downloadPDF = function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const text = document.getElementById('modal-content').innerText;
    const marginLeft = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxLineWidth = pageWidth - (marginLeft * 2);

    // Encabezado
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

    // Cuerpo
    doc.setFont("times", "normal");
    doc.setFontSize(12);
    doc.setTextColor(0);
    const splitText = doc.splitTextToSize(text, maxLineWidth);
    doc.text(splitText, marginLeft, 45);

    doc.save("Carta_Presentacion_Victor_Lopez.pdf");
}