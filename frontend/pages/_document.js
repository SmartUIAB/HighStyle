
import Document, { Html, Head, Main, NextScript } from 'next/document'
import { localeOf } from '../components/storefront/commerce.mjs'

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps, language: localeOf(ctx.query.lng) }
  }

  render() {
    return (
      <Html lang={this.props.language} dir={this.props.language === "ar" ? "rtl" : "ltr"}>
        <Head>
          <link href="https://fonts.googleapis.com/css2?family=Philosopher:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet"></link>
          <link href="https://fonts.googleapis.com/css?family=Lato:300,400,700,900" rel="stylesheet" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
