<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
                xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
                xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <xsl:output method="html" indent="yes" encoding="UTF-8"/>

  <xsl:template match="/">
    <html>
      <head>
        <title>Lars Ejaas | XML Sitemap</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
            color: #171c1c;
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
          }
          .flex {
            display: flex;
            align-items: center;
            gap: 1rem;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 2rem 0;
          }
          th, td {
            padding: 0.5rem;
            text-align: left;
            border-bottom: 1px solid #d8dfdf;
          }
          th {
            background-color: #f9fafa;
            font-weight: bold;
          }
          tr:hover {
            background-color: #f9fafa;
          }
          a {
            color: hsl(188.41deg 100% 30.78%);
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          h1 {
            color: #171c1c;
            margin-bottom: 1rem;
          }
          :root ::-webkit-scrollbar {
            width: 12px;
            height: 12px;
          }
          :root ::-webkit-scrollbar-thumb {
            border-radius: 8px;
            background: #4e5f60;
          }
          :root ::-webkit-scrollbar-corner {
            background-color: #aebabb;
          }
          :root ::-webkit-scrollbar-track {
            background: #aebabb;
          }
          .language-alternates {
            font-size: 0.9rem;
            color: #323d3e;
            margin-top: 0.25rem;
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
            margin-left: 0.25rem;
          }
          .language-alternates span {
            background: #e3e8e8;
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
            margin-right: 0.5rem;
            width: fit-content;
          }
        </style>
      </head>
      <body>
        <div class="flex">
            <img src="/icons/icon-144x144.png" alt="Lars Ejaas Logo" width="144" height="144" />
        <h1>XML Sitemap</h1>
        </div>
        <table>
          <tr>
            <th>URL</th>
            <th>Last Modified</th>
            <th>Change Frequency</th>
            <th>Priority</th>
          </tr>
          <xsl:for-each select="sitemap:urlset/sitemap:url">
            <tr>
              <td>
                <a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a>
                <xsl:if test="xhtml:link">
                  <div class="language-alternates">
                    <div>Alternative versions:</div>
                    <xsl:for-each select="xhtml:link">
                      <span>
                        <xsl:value-of select="@hreflang"/>: 
                        <a href="{@href}"><xsl:value-of select="@href"/></a>
                      </span>
                    </xsl:for-each>
                  </div>
                </xsl:if>
              </td>
              <td><xsl:value-of select="sitemap:lastmod"/></td>
              <td><xsl:value-of select="sitemap:changefreq"/></td>
              <td><xsl:value-of select="sitemap:priority"/></td>
            </tr>
          </xsl:for-each>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>