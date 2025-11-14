import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { Calendar, Smartphone, ArrowDown, Check, ChevronDown, Mail, Phone, User, Building2, Send } from 'lucide-react';

export default function Demo() {
  const [appointments, setAppointments] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);
  const [showPlans, setShowPlans] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    businessType: ''
  });
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Detectar desktop
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkDesktop();
    window.addEventListener('resize', checkDesktop);

    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  useEffect(() => {
    loadAppointments();

    const channel = supabase
      .channel('demo-appointments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: 'restaurant_id=db63ea52-be46-42f7-b577-ac5e498c5013'
        },
        (payload) => {
          console.log('🔄 Nueva cita:', payload);
          loadAppointments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('restaurant_id', 'db63ea52-be46-42f7-b577-ac5e498c5013')
        .gte('appointment_time', new Date().toISOString())
        .in('status', ['confirmado', 'completada'])
        .order('appointment_time', { ascending: true })
        .limit(20);

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error cargando citas:', error);
    }
  };

  const formatTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      const response = await fetch('http://localhost:3001/api/contact/demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Error al enviar');
      }

      setSubmitted(true);
      setFormData({ name: '', phone: '', email: '', businessType: '' });
    } catch (error) {
      console.error('Error enviando formulario:', error);
      alert('Error al enviar. Intenta de nuevo.');
    } finally {
      setSending(false);
    }
  };

  const whatsappNumber = import.meta.env.VITE_DEMO_WHATSAPP_NUMBER
  const whatsappMessage = encodeURIComponent('Hola, quiero agendar una cita');
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const faqs = [
    {
      q: '🚀 ¿Cómo funciona el panel de gestión?',
      a: 'Centraliza todas tus citas en un solo lugar. Verás en tiempo real las reservas hechas por tu Agente IA en WhatsApp, las que añadas manualmente desde el panel y las que lleguen desde Google o tus redes sociales. Además podrás consultar el historial completo de cada cliente y sus últimas visitas.'
    },
    {
      q: '🗓️ ¿Cómo puedo visualizar mis citas?',
      a: 'Tienes múltiples vistas para tu comodidad. El apartado "Citas de Hoy" se actualiza al instante (¡justo como en esta demo!). También cuentas con un calendario interactivo con vistas de día, semana y mes, y un listado completo para consultar el estado de cada reserva fácilmente.'
    },
    {
      q: '👥 ¿Me ayuda con la gestión de clientes?',
      a: '¡Por supuesto! Cada cliente que agendas (sea por IA o manualmente) se guarda automáticamente en tu base de datos. Podrás consultar su historial completo de visitas, servicios preferidos y datos de contacto. Además, puedes marcar clientes como VIP para ofrecerles un trato preferencial o aplicar promociones especiales.'
    },
    {
      q: '⚙️ ¿Es difícil de configurar?',
      a: '¡Para nada! Es muy intuitivo. Solo necesitas cargar tus servicios, duraciones y precios en el panel. Tu Agente IA usará esa información al instante para responder dudas y agendar citas por WhatsApp de forma automática y eficiente.'
    },
    {
      q: '💻 ¿Qué requisitos necesito?',
      a: '¡Muy simple! Para el Panel: Solo necesitas conexión a internet (puedes usarlo en tu móvil, tablet u ordenador). Para el Agente IA: Solo necesitas WhatsApp Business y un número de teléfono dedicado para tu negocio.'
    }
  ];

  const plans = [
    {
      name: 'Agenda Basic',
      price: '49',
      features: [
        'Panel de gestión completo',
        'Sistema de agenda para Google y Redes Sociales',
        'Gestión de clientes, horarios y servicios',
        'Estadísticas del negocio',
        'Emails de confirmación y recordatorios',
        'Ideal para 1-3 empleados'
      ]
    },
    {
      name: 'Agenda Pro',
      price: '59',
      features: [
        'Todos los beneficios de Agenda Basic',
        'Múltiples turnos por franja horaria',
        'Ideal para 4-10 empleados'
      ]
    },
    {
      name: 'Paul Basic',
      price: '99',
      popular: true,
      features: [
        'Todos los beneficios de Agenda Basic',
        'Agente IA "Paul" para WhatsApp 24/7',
        'Agenda automática y resuelve dudas',
        'Ideal para 1-3 empleados'
      ]
    },
    {
      name: 'Paul Octopus',
      price: '119',
      features: [
        'Todos los beneficios de Paul Basic',
        'Funciones para equipos grandes',
        'Múltiples turnos',
        'Ideal para 4-10 empleados'
      ]
    },
    {
      name: 'Business Total',
      price: 'Consultar',
      features: [
        'Solución 100% personalizada',
        'Ideal para franquicias',
        'Múltiples locales',
        'Adaptación a medida'
      ]
    }
  ];

  // VERSIÓN DESKTOP
  if (isDesktop) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Sidebar izquierdo - 1/4 */}
        <div className="w-1/4 bg-gray-900 px-10 py-10 flex flex-col items-center justify-between border-r border-gray-700">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Icono y título */}
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-pink-500/10 mb-2">
              <Calendar className="h-8 w-8 text-pink-500" />
            </div>

            <h1 className="text-xl font-bold text-white">Esthétique La Belle Époque</h1>

            {/* QR y botón */}
            <div className="bg-gray-800 p-5 rounded-lg w-full">
              <p className="text-sm text-gray-300 mb-3">Escanea el QR para agendar</p>

              <div className="bg-white p-3 rounded-lg mb-3">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(whatsappLink)}`}
                  alt="QR WhatsApp"
                  className="w-full h-auto"
                />
              </div>

              <div className="text-xs text-gray-400 mb-3">o</div>

              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-green-600"
              >
                <Smartphone className="h-4 w-4" />
                Abrir WhatsApp Web
              </a>
            </div>

            {/* Instrucciones */}
            <div className="bg-pink-500/10 p-3 rounded-lg text-left w-full">
              <p className="text-xs text-pink-300 font-semibold mb-1">💡 Instrucciones:</p>
              <ol className="text-xs text-gray-300 space-y-1">
                <li>1. Escanea el QR o haz clic en el botón</li>
                <li>2. Pide una cita al Agente IA</li>
                <li>3. ¡Mira cómo aparece aquí! →</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Contenido principal - 3/4 */}
        <div className="w-3/4 overflow-y-auto">
          {/* Header con introducción */}
          <div className="bg-gray-800 p-8 border-b border-gray-700">
            <h2 className="text-3xl font-bold text-pink-400 mb-4">
              🚀 ¡Prueba la Magia en Tiempo Real!
            </h2>

            <p className="text-gray-300 mb-4">
              Estás viendo un panel de demostración de "Esthétique La Belle Époque".
            </p>

            <p className="text-white font-semibold mb-4">
              Sigue estos 2 pasos y mira cómo funciona:
            </p>

            <ol className="space-y-3 text-gray-300">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-pink-500 text-sm font-bold text-white">
                  1
                </span>
                <span>
                  <strong className="text-white">Inicia una conversación:</strong> Haz clic en el botón de WhatsApp o escanea el QR para hablar con nuestro Agente IA. Pídele una cita (ej: "Quiero una limpieza facial para mañana por la tarde"). Pídele información sobre los servicios de la estética o sobre cualquier cosa que te gustaría saber.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-pink-500 text-sm font-bold text-white">
                  2
                </span>
                <span>
                  <strong className="text-white">Mira la magia:</strong> Una vez que el Agente IA confirme tu cita, aparecerá automáticamente y en tiempo real en el calendario de "Citas de Hoy" que ves en esta misma pantalla.
                </span>
              </li>
            </ol>
          </div>

          {/* Calendario */}
          <div className="p-8">
            <div className="max-w-2xl mx-auto">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  Próximas citas
                </h2>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                  <span className="text-sm text-gray-400">EN VIVO</span>
                </div>
              </div>

              <div className="space-y-3">
                {appointments.length === 0 ? (
                  <div className="rounded-lg bg-gray-700 p-8 text-center">
                    <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-500" />
                    <p className="text-gray-400">No hay citas programadas</p>
                    <p className="mt-2 text-sm text-gray-500">
                      Agenda una cita y aparecerá aquí en tiempo real
                    </p>
                  </div>
                ) : (
                  appointments.map((apt) => {
                    const aptDate = new Date(apt.appointment_time);
                    const isToday = aptDate.toDateString() === new Date().toDateString();

                    return (
                      <div
                        key={apt.id}
                        className="rounded-lg bg-gray-700 p-4 shadow-lg transition-all hover:bg-gray-600"
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-pink-400" />
                          <p className="text-sm font-medium text-pink-400">
                            {isToday ? 'HOY' : aptDate.toLocaleDateString('es-ES', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long'
                            })}
                          </p>
                        </div>

                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-white">{apt.client_name}</p>
                            <p className="text-sm text-gray-300">{apt.service_name}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-pink-400">
                              {formatTime(apt.appointment_time)}
                            </p>
                            <p className="text-xs text-gray-400">{apt.duration_minutes} min</p>
                          </div>
                        </div>
                        {apt.status === 'confirmado' && (
                          <div className="mt-2 inline-block rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
                            ✓ Confirmada
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-gray-900 px-8 py-16">
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-12 text-center text-3xl font-bold text-white">
                🧐 ¿Cómo te ayuda Paul en tu día a día?
              </h2>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="rounded-lg bg-gray-800 overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full flex items-center justify-between p-6 text-left transition-colors hover:bg-gray-700"
                    >
                      <span className="font-semibold text-white">{faq.q}</span>
                      <ChevronDown
                        className={`h-5 w-5 text-pink-400 transition-transform ${openFaq === index ? 'rotate-180' : ''
                          }`}
                      />
                    </button>
                    {openFaq === index && (
                      <div className="px-6 pb-6 text-gray-300">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Plans */}
          <div className="bg-gray-800 px-8 py-16">
            <div className="mx-auto max-w-5xl">
              <h2 className="mb-4 text-center text-3xl font-bold text-white">
                🚀 Elige el Plan Perfecto para ti
              </h2>

              <button
                onClick={() => setShowPlans(!showPlans)}
                className="mx-auto mb-8 flex items-center gap-2 rounded-lg bg-pink-500 px-6 py-3 font-semibold text-white transition-all hover:bg-pink-600"
              >
                {showPlans ? 'Ocultar Planes' : 'Ver Planes'}
                <ChevronDown className={`h-5 w-5 transition-transform ${showPlans ? 'rotate-180' : ''}`} />
              </button>

              {showPlans && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {plans.map((plan, index) => (
                    <div
                      key={index}
                      className={`rounded-lg p-6 ${plan.popular
                        ? 'bg-gradient-to-br from-pink-500 to-pink-600 ring-4 ring-pink-400'
                        : 'bg-gray-700'
                        }`}
                    >
                      {plan.popular && (
                        <div className="mb-4 inline-block rounded-full bg-white px-3 py-1 text-xs font-bold text-pink-600">
                          MÁS POPULAR
                        </div>
                      )}
                      <h3 className="mb-2 text-2xl font-bold text-white">{plan.name}</h3>
                      <div className="mb-6">
                        <span className="text-4xl font-bold text-white">{plan.price}</span>
                        {plan.price !== 'Consultar' && (
                          <span className="text-gray-300"> € / mes</span>
                        )}
                      </div>
                      <ul className="space-y-3">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="h-5 w-5 flex-shrink-0 text-white" />
                            <span className="text-sm text-gray-100">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-900 px-8 py-16">
            <div className="mx-auto max-w-md">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">
                  ¿Listo para automatizar tu negocio?
                </h2>
                <p className="text-gray-300">
                  Rellena el formulario y te activamos una prueba gratuita de 7 días.
                  Sin tarjetas de crédito y sin compromiso.
                </p>
              </div>

              {submitted ? (
                <div className="rounded-lg bg-green-500/20 p-8 text-center">
                  <Check className="mx-auto mb-4 h-16 w-16 text-green-400" />
                  <h3 className="mb-2 text-xl font-bold text-white">
                    ¡Formulario enviado!
                  </h3>
                  <p className="text-gray-300">
                    Te contactaremos pronto para activar tu prueba gratuita.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      Nombre completo
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-lg bg-gray-700 py-3 pl-11 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="Tu nombre"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      Teléfono
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full rounded-lg bg-gray-700 py-3 pl-11 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="+34 600 000 000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-lg bg-gray-700 py-3 pl-11 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="tu@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      Tipo de negocio
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <select
                        required
                        value={formData.businessType}
                        onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                        className="w-full rounded-lg bg-gray-700 py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                      >
                        <option value="">Selecciona...</option>
                        <option value="beauty_salon">Salón de Belleza</option>
                        <option value="barbershop">Barbería</option>
                        <option value="aesthetic_clinic">Clínica Estética</option>
                        <option value="dental_clinic">Clínica Dental</option>
                        <option value="restaurant">Restaurante</option>
                        <option value="other">Otro</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-pink-500 py-3 font-semibold text-white transition-all hover:bg-pink-600 disabled:opacity-50"
                  >
                    {sending ? (
                      'Enviando...'
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        Solicitar Prueba Gratuita
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-black px-8 py-8 text-center">
            <p className="text-gray-500">
              © 2025 Agent Paul. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    );
  }
  // VERSIÓN MÓVIL
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
        <div className="text-center max-w-2xl">
          <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-pink-500/10">
            <Calendar className="h-10 w-10 text-pink-500" />
          </div>

          <h1 className="mb-4 text-4xl font-bold text-white">
            Esthétique La Belle Époque
          </h1>

          {/* Introducción */}
          <div className="mb-8 rounded-lg bg-gray-800 p-6 text-left">
            <h2 className="mb-4 text-2xl font-bold text-pink-400">
              🚀 ¡Prueba la Magia en Tiempo Real!
            </h2>

            <p className="mb-4 text-gray-300">
              Estás viendo un panel de demostración de "Bella Estética".
            </p>

            <p className="mb-4 text-white font-semibold">
              Sigue estos 2 pasos y mira cómo funciona:
            </p>

            <ol className="space-y-3 text-gray-300">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-pink-500 text-sm font-bold text-white">
                  1
                </span>
                <span>
                  <strong className="text-white">Inicia una conversación:</strong> Haz clic en el botón de WhatsApp o escanea el QR para hablar con nuestro Agente IA. Pídele una cita (ej: "Quiero una limpieza facial para mañana por la tarde"). Pídele información sobre los servicios de la estética o sobre cualquier cosa que te gustaría saber.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-pink-500 text-sm font-bold text-white">
                  2
                </span>
                <span>
                  <strong className="text-white">Mira la magia:</strong> Una vez que el Agente IA confirme tu cita, aparecerá automáticamente y en tiempo real en el calendario que ves abajo.
                </span>
              </li>
            </ol>
          </div>


          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 rounded-lg bg-green-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-green-600 hover:scale-105"
          >
            <Smartphone className="h-6 w-6" />
            Abrir WhatsApp
          </a>

          {/* Instrucción adicional */}
          <p className="mt-4 text-sm text-gray-400">
            💡 Tip: Después de agendar, regresa aquí para ver tu cita en tiempo real
          </p>

          <div className="mt-16 animate-bounce">
            <ArrowDown className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-400">
              Desliza para ver tu cita
            </p>
          </div>
        </div>
      </div>

      {/* Calendario Section */}
      <div className="min-h-screen bg-gray-800 px-6 py-12">
        <div className="mx-auto max-w-md">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              Próximas citas
            </h2>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              <span className="text-sm text-gray-400">EN VIVO</span>
            </div>
          </div>

          <div className="space-y-3">
            {appointments.length === 0 ? (
              <div className="rounded-lg bg-gray-700 p-8 text-center">
                <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-500" />
                <p className="text-gray-400">No hay citas programadas</p>
                <p className="mt-2 text-sm text-gray-500">
                  Agenda una cita y aparecerá aquí en tiempo real
                </p>
              </div>
            ) : (
              appointments.map((apt) => {
                const aptDate = new Date(apt.appointment_time);
                const isToday = aptDate.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={apt.id}
                    className="rounded-lg bg-gray-700 p-4 shadow-lg transition-all hover:bg-gray-600"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-pink-400" />
                      <p className="text-sm font-medium text-pink-400">
                        {isToday ? 'HOY' : aptDate.toLocaleDateString('es-ES', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long'
                        })}
                      </p>
                    </div>

                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-white">{apt.client_name}</p>
                        <p className="text-sm text-gray-300">{apt.service_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-pink-400">
                          {formatTime(apt.appointment_time)}
                        </p>
                        <p className="text-xs text-gray-400">{apt.duration_minutes} min</p>
                      </div>
                    </div>
                    {apt.status === 'confirmado' && (
                      <div className="mt-2 inline-block rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
                        ✓ Confirmada
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Las citas se actualizan automáticamente
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-900 px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-white">
            🧐 ¿Cómo te ayuda Paul en tu día a día?
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="rounded-lg bg-gray-800 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left transition-colors hover:bg-gray-700"
                >
                  <span className="font-semibold text-white">{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-pink-400 transition-transform ${openFaq === index ? 'rotate-180' : ''
                      }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6 text-gray-300">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Plans Section */}
      <div className="bg-gray-800 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 text-center text-3xl font-bold text-white">
            🚀 Elige el Plan Perfecto para ti
          </h2>

          <button
            onClick={() => setShowPlans(!showPlans)}
            className="mx-auto mb-8 flex items-center gap-2 rounded-lg bg-pink-500 px-6 py-3 font-semibold text-white transition-all hover:bg-pink-600"
          >
            {showPlans ? 'Ocultar Planes' : 'Ver Planes'}
            <ChevronDown className={`h-5 w-5 transition-transform ${showPlans ? 'rotate-180' : ''}`} />
          </button>

          {showPlans && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className={`rounded-lg p-6 ${plan.popular
                    ? 'bg-gradient-to-br from-pink-500 to-pink-600 ring-4 ring-pink-400'
                    : 'bg-gray-700'
                    }`}
                >
                  {plan.popular && (
                    <div className="mb-4 inline-block rounded-full bg-white px-3 py-1 text-xs font-bold text-pink-600">
                      MÁS POPULAR
                    </div>
                  )}
                  <h3 className="mb-2 text-2xl font-bold text-white">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    {plan.price !== 'Consultar' && (
                      <span className="text-gray-300"> € / mes</span>
                    )}
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-5 w-5 flex-shrink-0 text-white" />
                        <span className="text-sm text-gray-100">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-gray-900 px-6 py-16">
        <div className="mx-auto max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              ¿Listo para automatizar tu negocio?
            </h2>
            <p className="text-gray-300">
              Rellena el formulario y te activamos una prueba gratuita de 7 días.
              Sin tarjetas de crédito y sin compromiso.
            </p>
          </div>

          {submitted ? (
            <div className="rounded-lg bg-green-500/20 p-8 text-center">
              <Check className="mx-auto mb-4 h-16 w-16 text-green-400" />
              <h3 className="mb-2 text-xl font-bold text-white">
                ¡Formulario enviado!
              </h3>
              <p className="text-gray-300">
                Te contactaremos pronto para activar tu prueba gratuita.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Nombre completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg bg-gray-700 py-3 pl-11 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Tu nombre"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-lg bg-gray-700 py-3 pl-11 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="+34 600 000 000"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg bg-gray-700 py-3 pl-11 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Tipo de negocio
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <select
                    required
                    value={formData.businessType}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                    className="w-full rounded-lg bg-gray-700 py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="">Selecciona...</option>
                    <option value="beauty_salon">Salón de Belleza</option>
                    <option value="barbershop">Barbería</option>
                    <option value="aesthetic_clinic">Clínica Estética</option>
                    <option value="dental_clinic">Clínica Dental</option>
                    <option value="restaurant">Restaurante</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-pink-500 py-3 font-semibold text-white transition-all hover:bg-pink-600 disabled:opacity-50"
              >
                {sending ? (
                  'Enviando...'
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Solicitar Prueba Gratuita
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-black px-6 py-8 text-center">
        <p className="text-gray-500">
          © 2025 Agent Paul. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};