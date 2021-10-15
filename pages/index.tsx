import Link from 'next/link'
import Layout from '../components/Layout'

const IndexPage = () => (
  <Layout title="ミズホエンジニアリング | ホーム">
    <h1>ミズホエンジニアリングタイムカードシステム　ホーム画面です</h1>
    <p>
      <Link href="/auth/login">
        <a>ログイン</a>
      </Link>
    </p>
  </Layout>
)

export default IndexPage
