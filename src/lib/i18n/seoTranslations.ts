/**
 * SEO Translations for Boutikio AI
 * French is the default language
 */

export type LanguageCode = 'fr' | 'en' | 'de' | 'nl' | 'pt' | 'pt-BR' | 'es' | 'ar';

export const languages: Record<LanguageCode, string> = {
	fr: 'Français',
	en: 'English',
	de: 'Deutsch',
	nl: 'Nederlands',
	pt: 'Português',
	'pt-BR': 'Português (Brasil)',
	es: 'Español',
	ar: 'العربية'
};

export const defaultLanguage: LanguageCode = 'fr';

export const languageDirections: Record<LanguageCode, 'ltr' | 'rtl'> = {
	fr: 'ltr',
	en: 'ltr',
	de: 'ltr',
	nl: 'ltr',
	pt: 'ltr',
	'pt-BR': 'ltr',
	es: 'ltr',
	ar: 'rtl' // Arabic is right-to-left
};

export type PageKey = 'home' | 'billing' | 'settings' | 'receipt' | 'card' | 'audit' | 'members';

interface SEOContent {
	title: string;
	description: string;
	keywords: string;
	h1?: string;
}

type SEOTTranslations = Record<LanguageCode, Record<PageKey, SEOContent>>;

export const seoTranslations: SEOTTranslations = {
	fr: {
		home: {
			title: 'Boutikio AI - Votre Assistant Fidélité Intelligent',
			description: 'Discutez avec votre assistant IA pour gérer vos membres, créer des bons, envoyer des récompenses et développer votre programme de fidélité.',
			keywords: 'programme fidélité IA, assistant IA entreprise, chatbot fidélité, rétention client, automation récompenses',
			h1: 'Discutez avec Maya'
		},
		billing: {
			title: 'Facturation & Abonnement',
			description: 'Gérez votre abonnement Boutikio, consultez vos factures, mettez à jour vos paiements. Offre gratuite : 100 membres actifs inclus.',
			keywords: 'tarifs fidélité, gestion abonnement, facturation, mettre à niveau, programme fidélité gratuit',
			h1: 'Facturation & Abonnement'
		},
		settings: {
			title: 'Paramètres du Compte',
			description: 'Configurez votre compte Boutikio, mettez à jour votre profil entreprise, les notifications et les préférences linguistiques.',
			keywords: 'paramètres compte, profil entreprise, notifications, préférences langue, configuration assistant IA',
			h1: 'Paramètres du Compte'
		},
		receipt: {
			title: 'Modèles de Tickets & Reçus',
			description: 'Personnalisez vos tickets numériques avec votre logo, couleurs et messages. Configurez l\'affichage des points de fidélité.',
			keywords: 'modèles tickets, tickets personnalisés, reçus numériques, personnalisation ticket, tickets fidélité',
			h1: 'Paramètres des Tickets'
		},
		card: {
			title: 'Aperçu & Design de la Carte de Fidélité',
			description: 'Prévisualisez votre carte de fidélité numérique pour Apple Wallet et Google Wallet. Personnalisez logo, bannière et couleurs.',
			keywords: 'aperçu carte fidélité, carte Apple Wallet, pass Google Wallet, design carte fidélité, carte mobile',
			h1: 'Aperçu de la Carte'
		},
		audit: {
			title: 'Journal d\'Activité & Historique',
			description: 'Consultez l\'historique complet de votre programme de fidélité. Suivez les actions membres, rachats de récompenses et activités.',
			keywords: 'journal activité, historique, traçabilité, suivi membres, conformité',
			h1: 'Journal d\'Activité'
		},
		members: {
			title: 'Annuaire & Gestion des Membres',
			description: 'Parcourez, recherchez et gérez les membres de votre programme. Profils, segments, métriques d\'engagement et réengagement.',
			keywords: 'annuaire membres, base clients, membres fidélité, segments, profils clients',
			h1: 'Membres'
		}
	},
	en: {
		home: {
			title: 'Boutikio AI - Your AI-Powered Loyalty Program Assistant',
			description: 'Chat with your AI assistant to manage members, create vouchers, send rewards, and grow your loyalty program.',
			keywords: 'loyalty program AI, AI assistant for business, loyalty chatbot, customer retention, reward automation',
			h1: 'Chat with Maya'
		},
		billing: {
			title: 'Billing & Subscription',
			description: 'Manage your Boutikio subscription, view invoices, update payment methods. Free tier includes 100 active members.',
			keywords: 'loyalty program pricing, subscription management, billing, upgrade plan, free loyalty program',
			h1: 'Billing & Subscription'
		},
		settings: {
			title: 'Account Settings',
			description: 'Configure your Boutikio account, update business profile, notification preferences, and language settings.',
			keywords: 'account settings, business profile, notification settings, language preferences, AI assistant configuration',
			h1: 'Account Settings'
		},
		receipt: {
			title: 'Receipt Settings & Templates',
			description: 'Customize digital receipt templates with your brand logo, colors, and messaging. Configure loyalty point display.',
			keywords: 'receipt templates, branded receipts, digital receipts, receipt customization, loyalty receipts',
			h1: 'Receipt Settings'
		},
		card: {
			title: 'Loyalty Card Preview & Design',
			description: 'Preview your digital loyalty card for Apple Wallet and Google Wallet. Customize logo, banner, and colors.',
			keywords: 'loyalty card preview, Apple Wallet card, Google Wallet pass, digital loyalty card design, mobile wallet card',
			h1: 'Card Preview'
		},
		audit: {
			title: 'Activity Log & Audit Trail',
			description: 'View complete activity history of your loyalty program. Track member actions, redemptions, and team activities.',
			keywords: 'activity log, audit trail, loyalty program history, member activity tracking, compliance log',
			h1: 'Audit Log'
		},
		members: {
			title: 'Member Directory & Management',
			description: 'Browse, search, and manage your loyalty program members. View profiles, segments, and engagement metrics.',
			keywords: 'member directory, customer database, loyalty members, member segments, customer profiles',
			h1: 'Members'
		}
	},
	de: {
		home: {
			title: 'Boutikio AI - Ihr KI-Treueprogramm-Assistent',
			description: 'Chatten Sie mit Ihrem KI-Assistenten, um Mitglieder zu verwalten, Gutscheine zu erstellen und Ihr Treueprogramm zu erweitern.',
			keywords: 'Treueprogramm KI, KI-Assistent Unternehmen, Treueprogramm Chatbot, Kundenbindung, Belohnungsautomation',
			h1: 'Chatten Sie mit Maya'
		},
		billing: {
			title: 'Abrechnung & Abonnement',
			description: 'Verwalten Sie Ihr Boutikio-Abonnement, Rechnungen und Zahlungsmethoden. Kostenlos: 100 aktive Mitglieder inklusive.',
			keywords: 'Treueprogramm Preise, Abonnementverwaltung, Abrechnung, Upgrade, kostenloses Treueprogramm',
			h1: 'Abrechnung & Abonnement'
		},
		settings: {
			title: 'Kontoeinstellungen',
			description: 'Konfigurieren Sie Ihr Boutikio-Konto, Geschäftsprofil, Benachrichtigungen und Spracheinstellungen.',
			keywords: 'Kontoeinstellungen, Geschäftsprofil, Benachrichtigungen, Spracheinstellungen, KI-Assistent Konfiguration',
			h1: 'Kontoeinstellungen'
		},
		receipt: {
			title: 'Bon-Vorlagen & Einstellungen',
			description: 'Passen Sie digitale Bon-Vorlagen mit Ihrem Logo, Farben und Nachrichten an. Konfigurieren Sie Treuepunkte-Anzeige.',
			keywords: 'Bon-Vorlagen, digitale Bons, Bon-Anpassung, Treuebons, Markenbons',
			h1: 'Bon-Einstellungen'
		},
		card: {
			title: 'Treuekarte Vorschau & Design',
			description: 'Vorschau Ihrer digitalen Treuekarte für Apple Wallet und Google Wallet. Logo, Banner und Farben anpassen.',
			keywords: 'Treuekarte Vorschau, Apple Wallet Karte, Google Wallet Pass, digitale Treuekarte, Mobile Wallet',
			h1: 'Kartenvorschau'
		},
		audit: {
			title: 'Aktivitätsprotokoll & Audit-Trail',
			description: 'Vollständige Aktivitätshistorie Ihres Treueprogramms. Mitgliedaktionen, Einlösungen und Teamaktivitäten verfolgen.',
			keywords: 'Aktivitätsprotokoll, Audit-Trail, Treueprogramm Historie, Aktivitätsverfolgung, Compliance',
			h1: 'Audit-Protokoll'
		},
		members: {
			title: 'Mitgliederverzeichnis & Verwaltung',
			description: 'Durchsuchen und verwalten Sie Ihre Treueprogramm-Mitglieder. Profile, Segmente und Engagement-Metriken.',
			keywords: 'Mitgliederverzeichnis, Kundendatenbank, Treueprogramm-Mitglieder, Segmente, Kundenprofile',
			h1: 'Mitglieder'
		}
	},
	nl: {
		home: {
			title: 'Boutikio AI - Uw AI-Assistent voor Trouwprogramma\'s',
			description: 'Chat met uw AI-assistent om leden te beheren, bonnen te maken en uw trouwprogramma te laten groeien.',
			keywords: 'trouwprogramma AI, AI-assistent bedrijven, trouwprogramma chatbot, klantenbinding, beloning automatisering',
			h1: 'Chat met Maya'
		},
		billing: {
			title: 'Facturatie & Abonnement',
			description: 'Beheer uw Boutikio-abonnement, bekijk facturen en update betaalmethoden. Gratis laag: 100 actieve leden.',
			keywords: 'trouwprogramma prijzen, abonnementsbeheer, facturatie, upgraden, gratis trouwprogramma',
			h1: 'Facturatie & Abonnement'
		},
		settings: {
			title: 'Accountinstellingen',
			description: 'Configureer uw Boutikio-account, update bedrijfsprofiel, notificaties en taalvoorkeuren.',
			keywords: 'accountinstellingen, bedrijfsprofiel, notificaties, taalvoorkeuren, AI-assistent configuratie',
			h1: 'Accountinstellingen'
		},
		receipt: {
			title: 'Boninstellingen & Sjablonen',
			description: 'Pas digitale bonsjablonen aan met uw logo, kleuren en berichten. Configureer trouwpunten-weergave.',
			keywords: 'bonsjablonen, digitale bonnen, bon-aanpassing, trouwbons, merkbons',
			h1: 'Boninstellingen'
		},
		card: {
			title: 'Trouwkaart Voorbeeld & Ontwerp',
			description: 'Bekijk uw digitale trouwkaart voor Apple Wallet en Google Wallet. Pas logo, banner en kleuren aan.',
			keywords: 'trouwkaart voorbeeld, Apple Wallet kaart, Google Wallet pass, digitale trouwkaart, mobile wallet',
			h1: 'Kaartvoorbeeld'
		},
		audit: {
			title: 'Activiteitenlog & Audit-Spoor',
			description: 'Bekijk volledige activiteitshistorie van uw trouwprogramma. Volg lidacties, inwisselingen en teamactiviteiten.',
			keywords: 'activiteitenlog, audit-spoor, trouwprogramma historie, activiteiten tracking, compliance',
			h1: 'Audit-Log'
		},
		members: {
			title: 'Ledenlijst & Beheer',
			description: 'Blader, zoek en beheer uw trouwprogramma-leden. Bekijk profielen, segmenten en betrokkenheidsstatistieken.',
			keywords: 'ledenlijst, klantendatabase, trouwprogramma leden, segmenten, klantprofielen',
			h1: 'Leden'
		}
	},
	pt: {
		home: {
			title: 'Boutikio AI - Seu Assistente de Fidelização com IA',
			description: 'Converse com seu assistente IA para gerir membros, criar vouchers e expandir seu programa de fidelização.',
			keywords: 'programa fidelização IA, assistente IA empresas, chatbot fidelização, retenção clientes, automação recompensas',
			h1: 'Converse com Maya'
		},
		billing: {
			title: 'Faturação & Subscrição',
			description: 'Gerir a sua subscrição Boutikio, ver faturas, atualizar pagamentos. Plano gratuito: 100 membros ativos.',
			keywords: 'preços fidelização, gestão subscrição, faturação, atualizar plano, programa fidelização gratuito',
			h1: 'Faturação & Subscrição'
		},
		settings: {
			title: 'Definições da Conta',
			description: 'Configure a sua conta Boutikio, atualize perfil da empresa, notificações e preferências de idioma.',
			keywords: 'definições conta, perfil empresa, notificações, preferências idioma, configuração assistente IA',
			h1: 'Definições da Conta'
		},
		receipt: {
			title: 'Modelos de Recibos & Definições',
			description: 'Personalize modelos de recibos digitais com logótipo, cores e mensagens. Configure exibição de pontos.',
			keywords: 'modelos recibos, recibos digitais, personalização recibos, recibos fidelização, recibos marca',
			h1: 'Definições de Recibos'
		},
		card: {
			title: 'Pré-visualização & Design do Cartão',
			description: 'Pré-visualize o seu cartão de fidelização digital para Apple Wallet e Google Wallet. Personalize logótipo e cores.',
			keywords: 'pré-visualização cartão, cartão Apple Wallet, passe Google Wallet, design cartão fidelização, mobile wallet',
			h1: 'Pré-visualização do Cartão'
		},
		audit: {
			title: 'Registo de Atividade & Auditoria',
			description: 'Veja o histórico completo do seu programa de fidelização. Acompanhe ações de membros e resgates.',
			keywords: 'registo atividade, auditoria, histórico fidelização, tracking membros, conformidade',
			h1: 'Registo de Auditoria'
		},
		members: {
			title: 'Diretório & Gestão de Membros',
			description: 'Navegue, pesquise e gerir membros do programa. Veja perfis, segmentos e métricas de envolvimento.',
			keywords: 'diretório membros, base dados clientes, membros fidelização, segmentos, perfis clientes',
			h1: 'Membros'
		}
	},
	'pt-BR': {
		home: {
			title: 'Boutikio AI - Seu Assistente de Fidelização com IA',
			description: 'Converse com seu assistente IA para gerenciar membros, criar vouchers e expandir seu programa de fidelização.',
			keywords: 'programa fidelização IA, assistente IA empresas, chatbot fidelização, retenção clientes, automação recompensas',
			h1: 'Converse com Maya'
		},
		billing: {
			title: 'Faturamento & Assinatura',
			description: 'Gerencie sua assinatura Boutikio, visualize faturas, atualize pagamentos. Plano gratuito: 100 membros ativos.',
			keywords: 'preços fidelização, gestão assinatura, faturamento, atualizar plano, programa fidelização gratuito',
			h1: 'Faturamento & Assinatura'
		},
		settings: {
			title: 'Configurações da Conta',
			description: 'Configure sua conta Boutikio, atualize perfil da empresa, notificações e preferências de idioma.',
			keywords: 'configurações conta, perfil empresa, notificações, preferências idioma, configuração assistente IA',
			h1: 'Configurações da Conta'
		},
		receipt: {
			title: 'Modelos de Recibos & Configurações',
			description: 'Personalize modelos de recibos digitais com logotipo, cores e mensagens. Configure exibição de pontos.',
			keywords: 'modelos recibos, recibos digitais, personalização recibos, recibos fidelização, recibos marca',
			h1: 'Configurações de Recibos'
		},
		card: {
			title: 'Pré-visualização & Design do Cartão',
			description: 'Pré-visualize seu cartão de fidelização digital para Apple Wallet e Google Wallet. Personalize logotipo e cores.',
			keywords: 'pré-visualização cartão, cartão Apple Wallet, passe Google Wallet, design cartão fidelização, mobile wallet',
			h1: 'Pré-visualização do Cartão'
		},
		audit: {
			title: 'Registro de Atividade & Auditoria',
			description: 'Veja o histórico completo do seu programa de fidelização. Acompanhe ações de membros e resgates.',
			keywords: 'registro atividade, auditoria, histórico fidelização, tracking membros, conformidade',
			h1: 'Registro de Auditoria'
		},
		members: {
			title: 'Diretório & Gestão de Membros',
			description: 'Navegue, pesquise e gerencie membros do programa. Veja perfis, segmentos e métricas de engajamento.',
			keywords: 'diretório membros, base dados clientes, membros fidelização, segmentos, perfis clientes',
			h1: 'Membros'
		}
	},
	es: {
		home: {
			title: 'Boutikio AI - Su Asistente de Fidelización con IA',
			description: 'Chatee con su asistente IA para gestionar miembros, crear vales y hacer crecer su programa de fidelización.',
			keywords: 'programa fidelización IA, asistente IA empresas, chatbot fidelización, retención clientes, automatización recompensas',
			h1: 'Chatee con Maya'
		},
		billing: {
			title: 'Facturación & Suscripción',
			description: 'Gestione su suscripción Boutikio, vea facturas y actualice pagos. Plan gratuito: 100 miembros activos.',
			keywords: 'precios fidelización, gestión suscripción, facturación, actualizar plan, programa fidelización gratuito',
			h1: 'Facturación & Suscripción'
		},
		settings: {
			title: 'Configuración de Cuenta',
			description: 'Configure su cuenta Boutikio, actualice perfil de empresa, notificaciones y preferencias de idioma.',
			keywords: 'configuración cuenta, perfil empresa, notificaciones, preferencias idioma, configuración asistente IA',
			h1: 'Configuración de Cuenta'
		},
		receipt: {
			title: 'Plantillas de Recibos & Configuración',
			description: 'Personalice plantillas de recibos digitales con su logo, colores y mensajes. Configure visualización de puntos.',
			keywords: 'plantillas recibos, recibos digitales, personalización recibos, recibos fidelización, recibos marca',
			h1: 'Configuración de Recibos'
		},
		card: {
			title: 'Vista Previa & Diseño de Tarjeta',
			description: 'Previsualice su tarjeta de fidelización digital para Apple Wallet y Google Wallet. Personalice logo y colores.',
			keywords: 'vista previa tarjeta, tarjeta Apple Wallet, pase Google Wallet, diseño tarjeta fidelización, mobile wallet',
			h1: 'Vista Previa de Tarjeta'
		},
		audit: {
			title: 'Registro de Actividad & Auditoría',
			description: 'Vea el historial completo de su programa de fidelización. Siga acciones de miembros y canjes.',
			keywords: 'registro actividad, auditoría, historial fidelización, seguimiento miembros, conformidad',
			h1: 'Registro de Auditoría'
		},
		members: {
			title: 'Directorio & Gestión de Miembros',
			description: 'Navegue, busque y gestione miembros del programa. Vea perfiles, segmentos y métricas de engagement.',
			keywords: 'directorio miembros, base datos clientes, miembros fidelización, segmentos, perfiles clientes',
			h1: 'Miembros'
		}
	},
	ar: {
		home: {
			title: 'Boutikio AI - مساعد برنامج الولاء الذكي الخاص بك',
			description: 'تحدث مع مساعد الذكاء الاصطناعي لإدارة الأعضاء وإنشاء القسائم وتنمية برنامج الولاء الخاص بك.',
			keywords: 'برنامج ولاء ذكي, مساعد ذكاء اصطناعي, روبوت محادثة الولاء, الاحتفاظ بالعملاء, أتمتة المكافآت',
			h1: 'تحدث مع Maya'
		},
		billing: {
			title: 'الفواتير والاشتراك',
			description: 'إدارة اشتراك Boutikio وعرض الفواتير وتحديث طرق الدفع. الخطة المجانية: 100 عضو نشط.',
			keywords: 'أسعار برنامج الولاء, إدارة الاشتراك, الفواتير, ترقية الخطة, برنامج ولاء مجاني',
			h1: 'الفواتير والاشتراك'
		},
		settings: {
			title: 'إعدادات الحساب',
			description: 'تكوين حساب Boutikio وتحديث ملف الشركة والإشعارات وتفضيلات اللغة.',
			keywords: 'إعدادات الحساب, ملف الشركة, الإشعارات, تفضيلات اللغة, تكوين المساعد الذكي',
			h1: 'إعدادات الحساب'
		},
		receipt: {
			title: 'قوالب الإيصالات والإعدادات',
			description: 'تخصيص قوالب الإيصالات الرقمية مع شعارك وألوانك ورسائلك. تكوين عرض نقاط الولاء.',
			keywords: 'قوالب الإيصالات, إيصالات رقمية, تخصيص الإيصالات, إيصالات الولاء, إيصالات العلامة التجارية',
			h1: 'إعدادات الإيصالات'
		},
		card: {
			title: 'معاينة وتصميم بطاقة الولاء',
			description: 'معاينة بطاقة الولاء الرقمية لـ Apple Wallet و Google Wallet. تخصيص الشعار والألوان.',
			keywords: 'معاينة بطاقة الولاء, بطاقة Apple Wallet, بطاقة Google Wallet, تصميم بطاقة الولاء, محفظة الهاتف',
			h1: 'معاينة البطاقة'
		},
		audit: {
			title: 'سجل النشاط والتدقيق',
			description: 'عرض السجل الكامل لنشاط برنامج الولاء. تتبع إجراءات الأعضاء والاستبدالات.',
			keywords: 'سجل النشاط, التدقيق, سجل برنامج الولاء, تتبع الأعضاء, الامتثال',
			h1: 'سجل التدقيق'
		},
		members: {
			title: 'دليل الأعضاء والإدارة',
			description: 'تصفح وابحث وأدر أعضاء برنامج الولاء. عرض الملفات الشخصية والشرائح ومقاييس المشاركة.',
			keywords: 'دليل الأعضاء, قاعدة بيانات العملاء, أعضاء الولاء, الشرائح, ملفات العملاء',
			h1: 'الأعضاء'
		}
	}
};

/**
 * Get SEO content for a page in a specific language
 */
export function getSEOContent(page: PageKey, lang: LanguageCode = defaultLanguage): SEOContent {
	return seoTranslations[lang][page];
}

/**
 * Get all alternate language URLs for hreflang tags
 */
export function getHreflangUrls(pathname: string, baseUrl?: string): Array<{ lang: LanguageCode; url: string }> {
	// Lazy import to avoid circular dependency at module level — callers can pass baseUrl directly
	const base = baseUrl || 'https://chat.boutikio.com';
	return Object.keys(languages).map((lang) => ({
		lang: lang as LanguageCode,
		url: `${base}${pathname}?lang=${lang}`
	}));
}