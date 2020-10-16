addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const links = [
  { name: 'Google', url: 'https://google.com' },
  { name: 'Facebook', url: 'https://facebook.com' },
  { name: 'LinkedIn', url: 'https://linkedin.com' },
  { name: 'Github', url: 'https://github.com' },
]

const staticURL = 'https://static-links-page.signalnerve.workers.dev'
const imgURL = 'https://i.imgur.com/8I1zZDT.png'

class LinksTransformer {
  constructor(links) {
    this.links = links
  }
  async element(element) {
    if (element.getAttribute('id') === 'links') {
      for (let link of links) {
        element.append(`<a href="${link.url}">${link.name}</a>`, { html: true })
      }
    } else if (element.getAttribute('id') === 'profile') {
      element.removeAttribute('style')
      element.setInnerContent(
        `<img src="${imgURL}" class="w-24 h-24 rounded-full shadow-md" id="avatar" /><h1 class="text-md text-white mt-2 font-semibold" id="name">Andrew Yang</h1>`,
        { html: true },
      )
    }
    return element
  }
}

/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  const path = new URL(request.url).pathname

  switch (path) {
    case '/links': {
      return new Response(JSON.stringify(links), {
        headers: { 'content-type': 'text/javascript' },
      })
    }

    default: {
      const rewriter = new HTMLRewriter()
      return new Response(
        await new HTMLRewriter()
          .on('div', new LinksTransformer(links))
          .transform(
            await fetch(new Request(staticURL), {
              headers: { 'content-type': 'text/html' },
            }),
          )
          .text(),
        {
          headers: { 'content-type': 'text/html' },
        },
      )
    }
  }
}
