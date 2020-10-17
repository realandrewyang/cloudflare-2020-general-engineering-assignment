// API Entry Point
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

// CONSTANTS
const links = [
  { name: 'Cloudflare', url: 'https://cloudflare.com' },
  { name: 'Hacker News', url: 'https://news.ycombinator.com/' },
  { name: 'Prequel Memes', url: 'https://www.reddit.com/r/PrequelMemes/' },
  { name: 'Beethoven - Moonlight Sonata', url: 'https://www.youtube.com/watch?v=4Tr0otuiQuU' },
]

const socialLinks = [
  { url: 'https://www.linkedin.com/in/realandrewyang/', src: 'linkedin.svg' },
  { url: 'https://github.com/realandrewyang/', src: 'github.svg' },
  { url: 'mailto:andrew.yang@uwaterloo.ca', src: 'microsoftoutlook.svg' },
]

const staticURL = 'https://static-links-page.signalnerve.workers.dev'
const imgURL = 'https://i.imgur.com/8I1zZDT.png'

// Transformer classes
class TitleTransformer {
  constructor(newTitle) {
    this.title = newTitle
  }

  async element(element) {
    element.setInnerContent(this.title)
    return element
  }
}


class BodyTransformer {
  constructor(className) {
    this.className = className
  }

  async element(element) {
    element.setAttribute("class", this.className)
    return element
  }
}

class LinksTransformer {
  constructor(links, socialLinks) {
    this.links = links
    this.socialLinks = socialLinks
  }
  async element(element) {
    switch (element.getAttribute('id')) {
      case 'links': {
        for (let link of this.links) {
          element.append(`<a href="${link.url}">${link.name}</a>`, { html: true })
        }
	break
      }
      case 'profile': {
        element.removeAttribute('style')
        element.setInnerContent(
          `<img src="${imgURL}" class="w-24 h-24 rounded-full shadow-md" id="avatar" /><h1 class="text-md text-white mt-2 font-semibold" id="name">Andrew Yang</h1>`,
          { html: true },
        )
	break
      }
      case 'social': {
        element.setAttribute("style", "")
	for (let link of this.socialLinks) {
          element.append(`<a href="${link.url}"><img src="https://cdn.jsdelivr.net/npm/simple-icons@v3/icons/${link.src}"/></a>`, { html: true})
        }
      }
    }
  }
}

/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  const path = new URL(request.url).pathname

  switch (path) {

    // Array of links as JSON
    case '/links': {
      return new Response(JSON.stringify(links), {
        headers: { 'content-type': 'text/javascript' },
      })
    }

    // Webpage
    default: {
      const rewriter = new HTMLRewriter()
      return new Response(
        await new HTMLRewriter()
	  .on('title', new TitleTransformer("Andrew Yang"))
	  .on('body', new BodyTransformer("bg-blue-500"))
          .on('div', new LinksTransformer(links, socialLinks))
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
