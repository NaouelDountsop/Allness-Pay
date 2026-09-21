import { config as loadEnv } from 'dotenv';
import { join } from 'node:path';
import { DataSource } from 'typeorm';
import { SupportCategory } from './entities/support-category.entity';
import { SupportArticle } from './entities/support-article.entity';
import { SupportQuestion } from './entities/support-question.entity';

loadEnv({ path: join(__dirname, '../../../../.env') });

const CATEGORIES = [
  { name: 'Transfert', code: 'TRANSFER', description: 'Questions sur les transferts d\'argent' },
  { name: 'Dépôt', code: 'DEPOSIT', description: 'Questions sur les dépôts' },
  { name: 'Retrait', code: 'WITHDRAWAL', description: 'Questions sur les retraits' },
  { name: 'Compte', code: 'ACCOUNT', description: 'Gestion du compte et paramètres' },
  { name: 'Sécurité', code: 'SECURITY', description: 'Sécurité et PIN' },
  { name: 'KYC', code: 'KYC', description: 'Vérification d\'identité' },
  { name: 'Tontine', code: 'TONTINE', description: 'Questions sur les tontines' },
  { name: 'Frais', code: 'FEES', description: 'Frais et tarifs' },
  { name: 'Transaction', code: 'TRANSACTION', description: 'Suivi des transactions' },
  { name: 'Technique', code: 'TECHNICAL', description: 'Problèmes techniques' },
];

const ARTICLES = [
  // TRANSFER
  {
    categoryCode: 'TRANSFER',
    title: 'Comment effectuer un transfert ?',
    content: 'Pour effectuer un transfert, ouvrez votre portefeuille, sélectionnez "Envoyer", choisissez le bénéficiaire, entrez le montant puis confirmez avec votre PIN.',
    questions: [
      { question: 'comment envoyer de l\'argent', keywords: ['envoyer', 'argent', 'transfert'] },
      { question: 'comment transférer', keywords: ['transférer', 'transfert', 'envoyer'] },
      { question: 'envoyer de l\'argent à quelqu\'un', keywords: ['envoyer', 'argent', 'personne'] },
    ],
  },
  {
    categoryCode: 'TRANSFER',
    title: 'Pourquoi mon transfert est-il en attente ?',
    content: 'Un transfert peut être en attente si le système vérifie la transaction. Cela prend généralement quelques minutes. Si le délai dépasse 30 minutes, contactez le support.',
    questions: [
      { question: 'transfert en attente', keywords: ['transfert', 'attente', 'en cours'] },
      { question: 'pourquoi ça traîne', keywords: ['attendre', 'lent', 'délai'] },
    ],
  },
  {
    categoryCode: 'TRANSFER',
    title: 'Mon transfert a échoué, que faire ?',
    content: 'Si votre transfert a échoué, l\'argent n\'a pas été débité. Vérifiez votre solde, vos données de bénéficiaire et réessayez. Si le problème persiste, contactez le support.',
    questions: [
      { question: 'transfert échoué', keywords: ['échoué', 'échec', 'raté'] },
      { question: 'envoi raté', keywords: ['raté', 'échoué', 'problème'] },
    ],
  },

  // DEPOSIT
  {
    categoryCode: 'DEPOSIT',
    title: 'Comment déposer de l\'argent ?',
    content: 'Pour déposer de l\'argent, allez dans "Portefeuille", sélectionnez "Dépôt", choisissez le mode de paiement (carte, Mobile Money), entrez le montant et validez.',
    questions: [
      { question: 'comment déposer', keywords: ['déposer', 'dépôt', 'ajouter'] },
      { question: 'comment ajouter de l\'argent', keywords: ['ajouter', 'argent', 'dépôt'] },
      { question: 'recharger mon portefeuille', keywords: ['recharger', 'portefeuille', 'solde'] },
    ],
  },
  {
    categoryCode: 'DEPOSIT',
    title: 'Mon dépôt n\'apparaît pas, que faire ?',
    content: 'Un dépôt peut mettre quelques minutes à apparaître. Vérifiez l\'historique des transactions. Si après 15 minutes rien n\'apparaît, vérifiez avec votre fournisseur de paiement.',
    questions: [
      { question: 'dépôt pas reçu', keywords: ['dépôt', 'reçu', 'manquant', 'apparaître'] },
      { question: 'argent pas arrivé', keywords: ['argent', 'arrivé', 'dépôt', 'manquant'] },
    ],
  },

  // WITHDRAWAL
  {
    categoryCode: 'WITHDRAWAL',
    title: 'Comment effectuer un retrait ?',
    content: 'Pour effectuer un retrait, allez dans "Portefeuille", sélectionnez "Retrait", choisissez le montant et le mode de retrait, puis confirmez avec votre PIN.',
    questions: [
      { question: 'comment retirer', keywords: ['retirer', 'retrait', 'encaisser'] },
      { question: 'comment prendre de l\'argent', keywords: ['prendre', 'argent', 'retirer'] },
    ],
  },
  {
    categoryCode: 'WITHDRAWAL',
    title: 'Mon retrait a échoué, que faire ?',
    content: 'Si votre retrait a échoué, votre solde n\'a pas été débité. Vérifiez que vous avez un solde suffisant et que les données sont correctes. Réessayez ou contactez le support.',
    questions: [
      { question: 'retrait échoué', keywords: ['retrait', 'échoué', 'raté', 'échec'] },
    ],
  },

  // ACCOUNT
  {
    categoryCode: 'ACCOUNT',
    title: 'Comment créer un compte ?',
    content: 'Téléchargez l\'application AllnessPay, cliquez sur "S\'inscrire", entrez votre numéro de téléphone, recevez et saisissez le code OTP, puis complétez vos informations.',
    questions: [
      { question: 'comment créer un compte', keywords: ['créer', 'compte', 'inscription', 's\'inscrire'] },
      { question: 'comment s\'inscrire', keywords: ['inscrire', 'inscription', 'nouveau'] },
    ],
  },
  {
    categoryCode: 'ACCOUNT',
    title: 'Comment modifier mon numéro de téléphone ?',
    content: 'Pour modifier votre numéro, allez dans "Profil" > "Paramètres" > "Numéro de téléphone". Vous devrez vérifier le nouveau numéro par OTP.',
    questions: [
      { question: 'changer numéro', keywords: ['changer', 'numéro', 'téléphone', 'modifier'] },
      { question: 'nouveau numéro', keywords: ['nouveau', 'numéro', 'téléphone'] },
    ],
  },
  {
    categoryCode: 'ACCOUNT',
    title: 'Comment changer mon mot de passe ?',
    content: 'Allez dans "Profil" > "Paramètres" > "Sécurité" > "Changer le mot de passe". Entrez l\'ancien mot de passe puis le nouveau.',
    questions: [
      { question: 'changer mot de passe', keywords: ['changer', 'mot', 'passe', 'password'] },
      { question: 'mot de passe oublié', keywords: ['oublié', 'mot', 'passe', 'récupérer'] },
    ],
  },

  // SECURITY
  {
    categoryCode: 'SECURITY',
    title: 'Comment réinitialiser mon PIN ?',
    content: 'Pour réinitialiser votre PIN, allez dans "Profil" > "Paramètres" > "PIN" > "Réinitialiser". Vous devrez vérifier votre identité par OTP.',
    questions: [
      { question: 'réinitialiser PIN', keywords: ['réinitialiser', 'pin', 'code', 'oublié'] },
      { question: 'pin bloqué', keywords: ['bloqué', 'pin', 'code', 'erroné'] },
    ],
  },
  {
    categoryCode: 'SECURITY',
    title: 'Mon compte est bloqué, que faire ?',
    content: 'Si votre compte est bloqué, contactez le support avec votre numéro de téléphone et une pièce d\'identité. Le déblocage prend 24-48 heures.',
    questions: [
      { question: 'compte bloqué', keywords: ['bloqué', 'compte', 'suspendu', 'verrouillé'] },
      { question: 'compte suspendu', keywords: ['suspendu', 'compte', 'désactivé'] },
    ],
  },

  // KYC
  {
    categoryCode: 'KYC',
    title: 'Comment effectuer la vérification KYC ?',
    content: 'Allez dans "Profil" > "Vérification", téléchargez une pièce d\'identité (carte, passeport) et un justificatif de domicile. La vérification prend 24-72 heures.',
    questions: [
      { question: 'comment vérifier mon identité', keywords: ['vérifier', 'identité', 'kyc', 'document'] },
      { question: 'vérification KYC', keywords: ['kyc', 'vérification', 'document', 'identité'] },
    ],
  },
  {
    categoryCode: 'KYC',
    title: 'Ma vérification KYC a été rejetée, que faire ?',
    content: 'Si votre KYC est rejeté, vérifiez que vos documents sont lisibles et non expirés. Vous pouvez soumettre de nouveaux documents dans "Profil" > "Vérification".',
    questions: [
      { question: 'kyc rejeté', keywords: ['rejeté', 'kyc', 'refusé', 'document'] },
      { question: 'vérification échouée', keywords: ['échoué', 'vérification', 'rejet'] },
    ],
  },

  // TONTINE
  {
    categoryCode: 'TONTINE',
    title: 'Comment rejoindre une tontine ?',
    content: 'Pour rejoindre une tontine, allez dans "Tontines", trouvez la tontine souhaitée via le code d\'invitation ou la recherche, puis cliquez "Rejoindre".',
    questions: [
      { question: 'comment rejoindre une tontine', keywords: ['rejoindre', 'tontine', 'adhérer'] },
      { question: 'adhérer à une tontine', keywords: ['adhérer', 'tontine', 'membre'] },
    ],
  },
  {
    categoryCode: 'TONTINE',
    title: 'Comment quitter une tontine ?',
    content: 'Pour quitter une tontine, allez dans "Tontines" > sélectionnez la tontine > "Paramètres" > "Quitter". Attention, les cotisations en cours restent dues.',
    questions: [
      { question: 'quitter tontine', keywords: ['quitter', 'tontine', 'sortir', 'arrêter'] },
    ],
  },

  // FEES
  {
    categoryCode: 'FEES',
    title: 'Quels sont les frais de transfert ?',
    content: 'Les frais de transfert dépendent du montant et de la destination. Consultez la grille tarifaire dans "Portefeuille" > "Frais" avant chaque transaction.',
    questions: [
      { question: 'frais de transfert', keywords: ['frais', 'transfert', 'tarif', 'coût'] },
      { question: 'combien ça coûte', keywords: ['coût', 'prix', 'frais', 'tarif'] },
    ],
  },
  {
    categoryCode: 'FEES',
    title: 'Quels sont les frais de dépôt ?',
    content: 'Le dépôt par carte bancaire est généralement gratuit. Les frais Mobile Money dépendent de votre opérateur. Consultez la grille tarifaire dans l\'application.',
    questions: [
      { question: 'frais de dépôt', keywords: ['frais', 'dépôt', 'tarif', 'gratuit'] },
    ],
  },

  // TRANSACTION
  {
    categoryCode: 'TRANSACTION',
    title: 'Comment consulter mes transactions ?',
    content: 'Allez dans "Transactions" depuis le menu principal. Vous pouvez filtrer par date, type (dépôt, retrait, transfert) et statut.',
    questions: [
      { question: 'voir mes transactions', keywords: ['voir', 'transactions', 'historique'] },
      { question: 'historique', keywords: ['historique', 'transactions', 'opérations'] },
    ],
  },
  {
    categoryCode: 'TRANSACTION',
    title: 'Comment vérifier le statut d\'une transaction ?',
    content: 'Dans "Transactions", cliquez sur la transaction concernée pour voir son statut détaillé : en attente, en cours, terminée ou échouée.',
    questions: [
      { question: 'statut transaction', keywords: ['statut', 'transaction', 'état', 'cours'] },
      { question: 'ma transaction est où', keywords: ['transaction', 'où', 'statut', 'en cours'] },
    ],
  },

  // TECHNICAL
  {
    categoryCode: 'TECHNICAL',
    title: 'L\'application ne fonctionne pas, que faire ?',
    content: 'Vérifiez votre connexion internet, mettez à jour l\'application, puis redémarrez-la. Si le problème persiste, désinstallez et réinstallez l\'application.',
    questions: [
      { question: 'application ne marche pas', keywords: ['application', 'marche', 'bug', 'plantage'] },
      { question: 'application bug', keywords: ['bug', 'plantage', 'erreur', 'crash'] },
    ],
  },
  {
    categoryCode: 'TECHNICAL',
    title: 'Comment mettre à jour l\'application ?',
    content: 'Allez dans votre store (App Store ou Google Play), cherchez AllnessPay et cliquez "Mettre à jour". Les mises à jour corrigent les bugs et ajoutent des fonctionnalités.',
    questions: [
      { question: 'mise à jour', keywords: ['mise', 'jour', 'update', 'version'] },
    ],
  },
];

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'afrilinkpay',
    password: process.env.DB_PASSWORD ?? 'afrilinkpay',
    database: process.env.DB_DATABASE ?? 'afrilinkpay',
    entities: [SupportCategory, SupportArticle, SupportQuestion],
  });

  await dataSource.initialize();
  console.warn('Connecté à la base de données');

  // 1. Créer les catégories
  const catRepo = dataSource.getRepository(SupportCategory);
  const cats: Map<string, SupportCategory> = new Map();
  for (const c of CATEGORIES) {
    let cat = await catRepo.findOne({ where: { code: c.code } });
    if (!cat) {
      cat = await catRepo.save(catRepo.create(c));
      console.warn(`Catégorie "${c.name}" créée`);
    } else {
      console.warn(`Catégorie "${c.name}" existe déjà`);
    }
    cats.set(c.code, cat);
  }

  // 2. Créer les articles avec questions
  const articleRepo = dataSource.getRepository(SupportArticle);
  const questionRepo = dataSource.getRepository(SupportQuestion);

  for (const a of ARTICLES) {
    const cat = cats.get(a.categoryCode);
    if (!cat) continue;

    let article = await articleRepo.findOne({
      where: { title: a.title, categoryId: cat.id },
    });
    if (!article) {
      article = await articleRepo.save(
        articleRepo.create({
          categoryId: cat.id,
          title: a.title,
          content: a.content,
        }),
      );
      console.warn(`Article "${a.title}" créé`);

      // Créer les questions
      for (const q of a.questions) {
        await questionRepo.save(
          questionRepo.create({
            articleId: article.id,
            question: q.question,
            keywords: q.keywords,
          }),
        );
      }
      console.warn(`  ${a.questions.length} questions associées`);
    } else {
      console.warn(`Article "${a.title}" existe déjà`);
    }
  }

  await dataSource.destroy();
  console.warn('\nSeed FAQ terminé !');
}

seed().catch((err) => {
  console.error('Erreur:', err);
  process.exit(1);
});
