import type { SeoFaqItem } from './gestione-ferie-dipendenti.content';

export const GESTIONE_FERIE_DIPENDENTI_TITLE = 'Gestione ferie dipendenti | TimeOffly';
export const GESTIONE_FERIE_DIPENDENTI_DESCRIPTION =
  'Scopri un modo semplice per gestire ferie, permessi e assenze del team. TimeOffly ti aiuta a organizzare tutto in modo piu chiaro rispetto a Excel.';

export const GESTIONE_FERIE_DIPENDENTI_FAQS: readonly SeoFaqItem[] = [
  {
    question: 'Come gestire le ferie dei dipendenti in modo semplice?',
    answer:
      'Un flusso unico per richieste, calendario e disponibilita rende la gestione piu chiara e riduce il tempo speso a cercare informazioni sparse.'
  },
  {
    question: 'Esiste un software per gestire ferie e permessi senza Excel?',
    answer:
      'Si, una soluzione dedicata puo aiutare a raccogliere ferie, permessi e assenze del team in un unico spazio piu ordinato rispetto ai fogli manuali.'
  },
  {
    question: 'Come evitare sovrapposizioni nelle assenze del team?',
    answer:
      'Una vista condivisa del calendario aiuta a controllare chi e gia assente o disponibile prima di approvare nuove richieste.'
  },
  {
    question: 'TimeOffly puo aiutare anche team piccoli?',
    answer:
      'Si, anche un team piccolo puo beneficiare di una gestione piu chiara di ferie e permessi, soprattutto quando vuole evitare processi sparsi.'
  }
] as const;

export const GESTIONE_FERIE_DIPENDENTI_FAQ_STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: GESTIONE_FERIE_DIPENDENTI_FAQS.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer
    }
  }))
};
