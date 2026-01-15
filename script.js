// NOTA: Ya no importamos GoogleGenerativeAI porque el servidor AWS se encarga de eso.
// import { GoogleGenerativeAI } ... (ELIMINADO)

// --- CONFIGURACIÓN ---
// Ahora apuntamos a TU servidor en AWS
const BACKEND_URL = "https://backend-victor.onrender.com/api/chat-cv";

let bookInstance = null;

// Contexto (Se envía al servidor en cada petición)
const CONTEXTO_CV = `
CANDIDATO: Victor R. Lopez. Ingeniero en Telemática (UNAN, 3er año). IT Manager en Kaitai Nicaragua.
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

// --- CHATBOT CONECTADO A AWS ---
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
    const loadId = addMsg('Consultando servidor...', 'ai-msg animate-pulse');
    
    try {
        // LLAMADA AL SERVIDOR AWS
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: text,
                context: CONTEXTO_CV
            })
        });

        if (!response.ok) throw new Error("Error en servidor AWS");

        const data = await response.json();
        
        document.getElementById(loadId).remove();
        addMsg(formatText(data.reply), 'ai-msg');

    } catch (e) {
        console.error(e);
        // SI FALLA AWS, USAMOS EL CEREBRO LOCAL
        document.getElementById(loadId).remove();
        const respuestaLocal = cerebroLocal(text.toLowerCase());
        addMsg(respuestaLocal + "<br><span style='font-size:9px; color:red'>(Modo Offline)</span>", 'ai-msg');
    }
}

// --- CEREBRO LOCAL (Respaldo) ---
function cerebroLocal(pregunta) {
    if (pregunta.includes('contacto') || pregunta.includes('correo') || pregunta.includes('celular')) {
        return "Contacto: <b>+505 8133-6115</b> o <b>victorlpz3293@gmail.com</b>.";
    }
    if (pregunta.includes('trabaja') || pregunta.includes('actual') || pregunta.includes('empresa')) {
        return "Actualmente es <b>Responsable de TI en Kaitai Nicaragua S.A.</b>";
    }
    return "No pude conectar con el servidor IA, pero soy Victor Lopez, IT Manager.";
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

// --- GENERADOR DE CARTA (Conectado a AWS) ---
const modal = document.getElementById('modal-overlay');
const modalContent = document.getElementById('modal-content');
const btnCover = document.getElementById('btn-cover-letter');

// Carta de Respaldo Fija (Por si falla AWS)
const CARTA_RESPALDO = `Estimado(a) Gerente de Selección,\n\nEs un placer presentar mi candidatura. Soy IT Manager con experiencia en virtualización y redes...\n\nAtentamente,\nVictor R. Lopez`;

if(btnCover) {
    btnCover.addEventListener('click', async () => {
        const originalText = btnCover.innerHTML;
        btnCover.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Redactando...';
        btnCover.disabled = true;
        
        try {
            // Reutilizamos el mismo endpoint de chat, pero con una instrucción específica
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: "Redacta una carta de presentación formal y profesional para un puesto de TI.",
                    context: CONTEXTO_CV
                })
            });

            if (!response.ok) throw new Error("Error AWS");
            const data = await response.json();
            modalContent.innerText = data.reply;

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

// --- DESCARGA PDF ---
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
    doc.text("victorlpz3293@gmail.com", marginLeft, 26);

    doc.setFont("times", "normal");
    doc.setFontSize(12);
    doc.setTextColor(0);
    const splitText = doc.splitTextToSize(text, maxLineWidth);
    doc.text(splitText, marginLeft, 40);

    doc.save("Carta_Presentacion_Victor_Lopez.pdf");
}
