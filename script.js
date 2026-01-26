// --- CONFIGURACIÓN ---
const BACKEND_URL = "https://backend-cv-b6f5.onrender.com/api/chat-cv";

let bookInstance = null;

// Contexto SUPER DETALLADO (Sincronizado con tu PDF Enero 2026)
const CONTEXTO_CV = `
PERFIL: Victor R. Lopez. IT Manager y Especialista en Infraestructura con +6 años de experiencia.
UBICACIÓN: Ciudad Sandino, Managua.
EDUCACIÓN: Ingeniería en Telemática (UNAN - Managua). Actualmente cursando 4to Año (2023-2027). Técnico Medio en Computación (Megabyte Service).

EXPERIENCIA LABORAL ACTUAL:
- Responsable de TI (IT Manager) en Kaitai Nicaragua S.A (Sept 2025 - Actualidad).
  Funciones: Gestión integral de TI, administración de servidores físicos/virtuales, seguridad, presupuestos y proveedores. Optimización de recursos y tiempos de respuesta.

EXPERIENCIA PREVIA:
- Oficial de TI en Mega Comunicaciones S.A (Oct 2022 - Jun 2025).
  Logros: Virtualización (VMWare/Proxmox), SysAdmin (AD, DNS, GPO), VoIP (Grandstream), ITIL.
- Ejecutivo de Servicio Técnico en Hermoso y Vigil S.A (Dic 2020 - Oct 2022).
  Funciones: Soporte a equipos RICOH, software PaperCut, atención al cliente.
- Soporte Técnico en IPESA de Nicaragua (May 2017 - Ene 2019).
  Funciones: Servidores HPE, equipos Lenovo, redes y virtualización básica.

HABILIDADES TÉCNICAS (HARD SKILLS):
- Virtualización: Experto en VMWare ESXi y ProxmoxVE.
- Sistemas Operativos: Windows Server (Admin avanzada), Linux.
- Redes: Cisco (CCNAv7), Mikrotik, TCP/IP, VLANs, Routing/Switching.
- Ciberseguridad: Hacking Ético, Análisis Forense, Gestión de Accesos.

CERTIFICACIONES:
- Analista SOC Nivel 1 (Comunidad Dojo, 2025).
- Google IT Support Certificate (2024).
- CCNAv7: Introducción a Redes (2023).
- Análisis Forense en Windows (2022).
- Especialista en Soporte IT (LinkedIn, 2020).

CONTACTO:
- Teléfono: +505 8133-6115
- Correo: victorlpz3293@gmail.com
`;

// --- INICIALIZACIÓN DEL LIBRO ---
document.addEventListener('DOMContentLoaded', () => {
    const bookElement = document.getElementById('book');
    if(bookElement) {
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
    }
});

// --- CHATBOT ---
const chatWindow = document.getElementById('chat-window');
const chatInput = document.getElementById('chat-input');
const msgsDiv = document.getElementById('chat-messages');
const toggleBtn = document.getElementById('toggle-chat');
const closeBtn = document.getElementById('close-chat');
const sendBtn = document.getElementById('send-chat');

if(toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        chatWindow.classList.toggle('hidden');
        chatWindow.classList.toggle('flex');
        if(!chatWindow.classList.contains('hidden')) chatInput.focus();
    });
}

if(closeBtn) {
    closeBtn.addEventListener('click', () => {
        chatWindow.classList.add('hidden');
        chatWindow.classList.remove('flex');
    });
}

if(sendBtn) {
    sendBtn.addEventListener('click', sendMessage);
}

if(chatInput) {
    chatInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') sendMessage(); });
}

async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    addMsg(text, 'user-msg');
    chatInput.value = '';
    const loadId = addMsg('Consultando servidor...', 'ai-msg animate-pulse');
    
    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: text,
                context: CONTEXTO_CV
            })
        });

        if (!response.ok) throw new Error("Error en servidor AWS/Render");

        const data = await response.json();
        
        const loader = document.getElementById(loadId);
        if(loader) loader.remove();
        
        addMsg(formatText(data.reply), 'ai-msg');

    } catch (e) {
        console.error(e);
        const loader = document.getElementById(loadId);
        if(loader) loader.remove();
        
        // RESPUESTA OFFLINE INTELIGENTE
        const respuestaLocal = cerebroLocal(text.toLowerCase());
        addMsg(respuestaLocal + "<br><span style='font-size:9px; color:red'>(Modo Offline)</span>", 'ai-msg');
    }
}

function cerebroLocal(pregunta) {
    if (pregunta.includes('contacto') || pregunta.includes('correo') || pregunta.includes('telefono')) {
        return "Puedes contactarme al <b>+505 8133-6115</b> o <b>victorlpz3293@gmail.com</b>.";
    }
    if (pregunta.includes('trabajo') || pregunta.includes('actual') || pregunta.includes('experiencia')) {
        return "Actualmente soy <b>Responsable de TI en Kaitai Nicaragua S.A.</b>";
    }
    if (pregunta.includes('estudio') || pregunta.includes('universidad')) {
        return "Estoy cursando el 4to año de Ingeniería en Telemática en la UNAN.";
    }
    return "No pude conectar con el servidor IA, pero soy Victor Lopez, IT Manager. ¿En qué puedo ayudarte?";
}

function addMsg(html, cssClass) {
    const div = document.createElement('div');
    div.className = cssClass;
    div.innerHTML = html;
    msgsDiv.appendChild(div);
    msgsDiv.scrollTop = msgsDiv.scrollHeight;
    return div.id = 'msg-' + Date.now();
}

function formatText(text) { 
    if(!text) return "";
    return text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>'); 
}

// --- GENERADOR DE CARTA ---
const modal = document.getElementById('modal-overlay');
const modalContent = document.getElementById('modal-content');
const btnCover = document.getElementById('btn-cover-letter');

// Carta de Respaldo Fija
const CARTA_RESPALDO = `Estimados responsables de Selección, \n\nLe escribo con gran entusiasmo para presentar mi candidatura a la posición que actualmente tienen disponible. Con más de 6 años de experiencia progresiva en el sector tecnológico, poseo la combinación de liderazgo estratégico y capacidad técnica operativa necesaria para aportar valor inmediato a su organización. \n\nMi trayectoria me ha permitido especializarme en la administración de entornos virtualizados (VMware ESXi, ProxmoxVE), seguridad informática y gestión de servidores Windows y Linux. No solo gestiono equipos, sino que mantengo un enfoque "hands-on" para resolver incidencias críticas de infraestructura. \n\n¿Por qué considero que soy el candidato ideal? \n\n•	Visión Integral: Combino la ejecución técnica avanzada con la planificación estratégica y gestión de presupuestos. \n\n•	Experiencia Comprobada: He administrado infraestructuras complejas y liderado migraciones tecnológicas exitosas en mis roles anteriores. \n\n•	Formación Continua: Actualmente curso el 4to año de Ingeniería en Telemática, lo que me mantiene actualizado con las últimas tendencias en redes y telecomunicaciones. \n\nMe considero un profesional proactivo, ético y orientado a resultados, capaz de alinear las soluciones tecnológicas con los objetivos comerciales de la empresa. \n\nAgradezco de antemano su tiempo para revisar mi perfil. Quedo a su entera disposición para concertar una entrevista y profundizar en cómo mi experiencia puede beneficiar a su equipo. \n\nAtentamente,\nVictor R. Lopez`;
if(btnCover) {
    btnCover.addEventListener('click', async () => {
        const originalText = btnCover.innerHTML;
        btnCover.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Redactando...';
        btnCover.disabled = true;
        
        try {
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: "Redacta una carta de presentación formal y persuasiva para un puesto de Gerencia TI o Infraestructura, destacando mi rol actual en Kaitai y mis certificaciones.",
                    context: CONTEXTO_CV
                })
            });

            if (!response.ok) throw new Error("Error API");
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
window.copyText = () => navigator.clipboard.writeText(modalContent.innerText).then(() => alert("Texto copiado al portapapeles"));

// --- DESCARGA PDF ---
window.downloadPDF = function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const text = document.getElementById('modal-content').innerText || "";
    const marginLeft = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxLineWidth = pageWidth - (marginLeft * 2);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(30, 58, 138);
    doc.text("Victor R. Lopez", marginLeft, 20);
    doc.setFontSize(10);
    doc.text("IT Manager | victorlpz3293@gmail.com", marginLeft, 26);

    doc.setFont("times", "normal");
    doc.setFontSize(12);
    doc.setTextColor(0);
    
    const splitText = doc.splitTextToSize(text, maxLineWidth);
    doc.text(splitText, marginLeft, 40);

    doc.save("Carta_Presentacion_Victor_Lopez.pdf");
}
