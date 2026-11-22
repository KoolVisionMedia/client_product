import { useCallback, useRef } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Tilt from 'react-parallax-tilt';
import { ArrowRight, Calendar, Tag, X } from 'lucide-react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { blogArticles } from '../data/blogArticles';
import { blogPosts, blogPostPath, postDateLabel, type BlogPost } from '../data/blogPosts';
import SEO from '../components/SEO';
import { useDialog } from '../hooks/useDialog';

const SITE = 'https://www.homefrontbuilderstn.com';

const ORG = {
  '@type': 'Organization',
  name: 'Homefront Builders',
  url: SITE,
  logo: { '@type': 'ImageObject', url: `${SITE}/logo-main.png` },
};

// Only posts that have a body are listed or linked.
const posts = blogPosts.filter((p) => blogArticles[p.slug]);

/** Article markdown, guaranteed to open with the post title as its one <h1>. */
function articleBody(post: BlogPost) {
  const md = blogArticles[post.slug].trimStart();
  return md.startsWith('# ') ? md : `# ${post.title}\n\n${md}`;
}

const plainText = (md: string) =>
  md
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#*_`>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/** Q&A pairs from an article's "## Frequently Asked Questions" section (### question, answer paragraph). */
function articleFaq(md: string) {
  const start = md.indexOf('\n## Frequently Asked Questions');
  if (start < 0) return [];
  const rest = md.slice(start + 1);
  const end = rest.indexOf('\n## ');
  const section = end < 0 ? rest : rest.slice(0, end);
  return section
    .split('\n### ')
    .slice(1)
    .map((block) => {
      const [question, ...lines] = block.split('\n');
      const answer = lines.join('\n').split(/\n\s*\n/).map((p) => p.trim()).find(Boolean) ?? '';
      return { question: question.trim(), answer: plainText(answer) };
    })
    .filter((qa) => qa.question && qa.answer);
}

function postingSchema(post: BlogPost) {
  const url = `${SITE}${blogPostPath(post.slug)}`;
  return {
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: post.title,
    description: post.excerpt,
    datePublished: post.published,
    dateModified: post.updated ?? post.published,
    image: `${SITE}${post.image}`,
    articleSection: post.category,
    url,
    mainEntityOfPage: url,
    inLanguage: 'en-US',
    author: ORG,
    publisher: ORG,
    ...(post.keywords ? { keywords: post.keywords.join(', ') } : {}),
  };
}

const blogSchema = [
  {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${SITE}/blog`,
    name: 'Homefront Builders Custom Home Building Blog',
    description: "Custom home building tips, design trends, and Clarksville TN housing market insights from Homefront Builders.",
    url: `${SITE}/blog`,
    publisher: ORG,
    blogPost: posts.map(postingSchema),
  },
];

function articleSchema(post: BlogPost) {
  const md = blogArticles[post.slug];
  const faq = articleFaq(md);
  return [
    {
      '@context': 'https://schema.org',
      ...postingSchema(post),
      wordCount: plainText(md).split(' ').length,
      isPartOf: { '@type': 'Blog', '@id': `${SITE}/blog` },
    },
    ...(faq.length
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faq.map(({ question, answer }) => ({
              '@type': 'Question',
              name: question,
              acceptedAnswer: { '@type': 'Answer', text: answer },
            })),
          },
        ]
      : []),
  ];
}

/** Up to three other posts to read next: same category first, then the most recent. */
function relatedPosts(post: BlogPost) {
  const others = posts.filter((p) => p.slug !== post.slug);
  return [
    ...others.filter((p) => p.category === post.category),
    ...others.filter((p) => p.category !== post.category),
  ].slice(0, 3);
}

const PostDate = ({ post }: { post: BlogPost }) => (
  <time dateTime={post.updated ?? post.published}>{postDateLabel(post)}</time>
);

// Site links inside an article navigate in-app; outside links open in a new tab.
const markdownComponents: Components = {
  a: ({ href = '', children }) =>
    href.startsWith('/') ? (
      <Link to={href}>{children}</Link>
    ) : (
      <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
    ),
};

export default function Blog() {
  // Each article lives at /blog/<slug> and renders as an overlay on the blog list, so the
  // article is in the prerendered HTML at its own URL (indexable) while keeping the modal feel.
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const openPost = slug ? posts.find((p) => p.slug === slug) : undefined;

  // Opened from the list: step back so the list stays where it was. Landed directly: go to /blog.
  const closePost = useCallback(() => {
    if ((location.state as { fromList?: boolean } | null)?.fromList) navigate(-1);
    else navigate('/blog', { replace: true });
  }, [location.state, navigate]);

  // Escape closes; focus moves into the article and back; the list behind
  // neither scrolls nor takes Tab focus while it's open.
  const articleRef = useRef<HTMLDivElement>(null);
  useDialog(!!openPost, closePost, articleRef);

  if (slug && !openPost) return <Navigate to="/blog" replace />;

  const [featuredPost, ...remainingPosts] = posts;
  // The article supplies the page's <h1> while one is open.
  const HeroHeading = openPost ? 'p' : 'h1';

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as any } }
  };

  return (
    <div className="bg-[#F4F3F0] min-h-screen">
      {openPost ? (
        <SEO
          title={openPost.seoTitle ?? openPost.title}
          description={openPost.excerpt}
          path={blogPostPath(openPost.slug)}
          type="article"
          image={openPost.image}
          imageAlt={openPost.title}
          publishedTime={openPost.published}
          modifiedTime={openPost.updated ?? openPost.published}
          parents={[{ name: 'Blog', path: '/blog' }]}
          schema={articleSchema(openPost)}
        />
      ) : (
        <SEO
          title="Custom Home Building Blog: Clarksville & Middle TN Guides"
          description="Guides to building a custom home in Clarksville and Middle Tennessee: buying land, VA construction loans, costs, timelines, choosing a builder, and design."
          path="/blog"
          schema={blogSchema}
        />
      )}
      {/* Article Overlay — /blog/<slug>. initial={false}: when the page is opened at an article
          URL (prerendered), the article renders fully visible instead of fading in from opacity 0.
          It comes first in the page so its <h1> and text lead the prerendered HTML (crawlers,
          AI search) ahead of the list behind it; it's a fixed overlay, so its place in the
          markup doesn't change how it looks. */}
      <AnimatePresence initial={false}>
        {openPost && (
          <motion.div
            key={openPost.slug}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePost}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12 bg-[#1A2118]/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              ref={articleRef}
              role="dialog"
              aria-modal="true"
              aria-label={openPost.title}
              className="relative w-full max-w-4xl max-h-full bg-[#FAFAF5] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header with Close Button */}
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
                <button
                  onClick={closePost}
                  className="p-2 sm:p-3 bg-white/90 hover:bg-white backdrop-blur-md rounded-full text-primary hover:text-[#c9a96e] transition-colors shadow-sm"
                  aria-label="Close article"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Article Content */}
              <div className="p-8 sm:p-12 md:p-16 overflow-y-auto">
                <article className="prose prose-stone prose-lg md:prose-xl max-w-none prose-headings:font-serif prose-headings:text-primary prose-a:text-[#c9a96e] hover:prose-a:text-primary transition-colors prose-strong:text-primary">
                  <p className="not-prose flex flex-wrap items-center gap-4 text-xs font-sans tracking-widest text-[#c9a96e] uppercase mb-6">
                    <span className="flex items-center gap-1.5"><Calendar size={14} /> <PostDate post={openPost} /></span>
                    <span className="flex items-center gap-1.5"><Tag size={14} /> {openPost.category}</span>
                  </p>
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {articleBody(openPost)}
                  </ReactMarkdown>
                </article>

                {/* Keep reading — internal links to related articles */}
                <aside aria-labelledby="keep-reading" className="mt-16 pt-10 border-t border-primary/10">
                  <h2 id="keep-reading" className="font-serif text-2xl md:text-3xl text-primary mb-6">Keep Reading</h2>
                  <ul className="grid gap-4 md:grid-cols-3">
                    {relatedPosts(openPost).map((post) => (
                      <li key={post.slug}>
                        <Link
                          to={blogPostPath(post.slug)}
                          className="group block h-full rounded-2xl bg-white p-5 shadow-sm hover:shadow-lg transition-shadow"
                        >
                          <span className="block text-[10px] font-sans tracking-widest uppercase text-[#c9a96e] mb-2">{post.category}</span>
                          <span className="block font-serif text-lg leading-snug text-primary group-hover:text-[#c9a96e] transition-colors">{post.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </aside>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero with Parallax & Glassmorphism */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden flex items-center justify-center">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          src="/assets/DSC04388-Edit.webp"
          alt="Custom home building insights and tips from Homefront Builders in Clarksville, TN"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#1b2518]/40" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 p-10 md:p-16 rounded-3xl text-center max-w-3xl mx-4 shadow-2xl"
        >
          <p className="text-xs md:text-sm font-sans tracking-[0.4em] uppercase text-[#c9a96e] mb-4 drop-shadow-md">The Journal</p>
          <HeroHeading className="font-serif text-4xl md:text-6xl text-white tracking-wide drop-shadow-lg">
            Insights & Inspiration
          </HeroHeading>
        </motion.div>
      </section>

      {/* Featured Post (Index 0) */}
      <section className="px-6 md:px-12 max-w-site-1280 mx-auto -mt-16 md:-mt-24 relative z-20">
        <Tilt
          tiltMaxAngleX={3}
          tiltMaxAngleY={3}
          scale={1.02}
          transitionSpeed={2500}
          className="cursor-pointer"
          glareEnable={true}
          glareMaxOpacity={0.15}
          glarePosition="all"
        >
          <Link to={blogPostPath(featuredPost.slug)} state={{ fromList: true }} className="block">
          <motion.article
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row group"
          >
            {/* Image Half */}
            <div className="lg:w-3/5 relative overflow-hidden aspect-video lg:aspect-auto">
              <img loading="lazy" decoding="async" src={featuredPost.image}
                alt={`${featuredPost.title} — custom home building advice from Homefront Builders`}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute top-6 left-6">
                <span className="bg-white/90 backdrop-blur-md px-4 py-2 text-xs font-sans tracking-[0.2em] uppercase font-bold text-primary rounded-sm shadow-sm">
                  Featured Article
                </span>
              </div>
            </div>

            {/* Content Half */}
            <div className="lg:w-2/5 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-4 text-xs font-sans tracking-widest text-[#c9a96e] uppercase mb-4">
                <span className="flex items-center gap-1.5"><Calendar size={14} /> <PostDate post={featuredPost} /></span>
                <span className="hidden md:block w-1 h-1 rounded-full bg-primary/20" />
                <span className="flex items-center gap-1.5"><Tag size={14} /> {featuredPost.category}</span>
              </div>

              <h2 className="font-serif text-3xl md:text-4xl text-primary mb-6 leading-tight group-hover:text-[#c9a96e] transition-colors duration-500">
                {featuredPost.title}
              </h2>

              <p className="text-primary-light/80 font-sans text-base leading-relaxed mb-8">
                {featuredPost.excerpt}
              </p>

              <div className="mt-auto pt-8 border-t border-gray-100 flex items-center gap-3 text-sm font-sans tracking-[0.2em] uppercase font-bold text-primary">
                Read Full Story
                <ArrowRight size={18} className="text-[#c9a96e] transform group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </div>
          </motion.article>
          </Link>
        </Tilt>
      </section>

      {/* Standard Grid */}
      <section className="py-24 px-6 md:px-12 max-w-site-1280 mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "0px 0px -100px 0px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-12"
        >
          {remainingPosts.map((post) => (
            <motion.div key={post.slug} variants={itemVariants}>
              <Tilt
                tiltMaxAngleX={5}
                tiltMaxAngleY={5}
                scale={1.03}
                transitionSpeed={2000}
                className="cursor-pointer h-full"
                glareEnable={true}
                glareMaxOpacity={0.1}
                glarePosition="all"
              >
                <Link to={blogPostPath(post.slug)} state={{ fromList: true }} className="block h-full">
                <article
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-500 h-full flex flex-col group"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img loading="lazy" decoding="async" src={post.image}
                      alt={`${post.title} — custom home building advice from Homefront Builders`}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/95 px-3 py-1 text-[10px] font-sans tracking-widest uppercase font-bold text-primary rounded-sm shadow-sm">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-8 flex flex-col flex-1">
                    <p className="text-[10px] font-sans tracking-widest text-[#c9a96e] uppercase mb-3 flex items-center gap-1.5">
                      <Calendar size={12} /> <PostDate post={post} />
                    </p>
                    <h3 className="font-serif text-2xl text-primary mb-4 group-hover:text-[#c9a96e] transition-colors duration-500">
                      {post.title}
                    </h3>
                    <p className="text-primary-light/70 font-sans text-sm leading-relaxed line-clamp-3 mb-6">
                      {post.excerpt}
                    </p>
                    <div className="mt-auto pt-6 border-t border-gray-50 flex items-center gap-2 text-[11px] font-sans tracking-[0.2em] uppercase font-bold text-primary">
                      Read Article
                      <ArrowRight size={14} className="text-[#c9a96e] transform group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </div>
                </article>
                </Link>
              </Tilt>
            </motion.div>
          ))}
        </motion.div>
      </section>

    </div>
  );
}
