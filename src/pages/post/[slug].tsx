import { GetStaticPaths, GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import PrismicDOM from 'prismic-dom';

import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useRouter } from 'next/router';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Header />
      <div>
        <div className={styles.background}>
          <img src="/images/teste.png" alt="teste" />
        </div>
        <main className={commonStyles.container}>
          <div className={styles.content}>
            <h1>{post.data.title}</h1>

            <div className={styles.infos}>
              <span>
                <FiCalendar size={20} color="#BBBBBB" />
                {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                  locale: ptBR,
                })}
              </span>
              <span>
                <FiUser size={20} color="#BBBBBB" />
                {post.data.author}
              </span>
              <span>
                <FiClock size={20} color="#BBBBBB" />4 min
              </span>
            </div>

            {post.data.content.map((text, index) => (
              <div className={styles.contentBody} key={index}>
                <h2>{text.heading}</h2>

                <div
                  dangerouslySetInnerHTML={{
                    __html: PrismicDOM.RichText.asHtml(text.body),
                  }}
                />
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.Predicates.at('document.type', 'post')],
    {
      pageSize: 5,
    }
  );

  const paths = posts.results.map(post => ({ params: { slug: post.uid } }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const prismic = getPrismicClient();
  const response = await prismic.getByUID(
    'post',
    String(context.params.slug),
    {}
  );

  const post = {
    first_publication_date: response.first_publication_date,
    uid: response.uid,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(item => ({
        heading: item.heading,
        body: item.body,
      })),
    },
  };

  return {
    props: {
      post,
    },
  };
};
