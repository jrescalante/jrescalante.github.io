lucide.createIcons();

const visualTabs = document.querySelectorAll('.visual-tab');
const visualCards = document.querySelectorAll('.visual-card');

visualTabs.forEach((tab) => {
	tab.addEventListener('click', () => {
		const filter = tab.dataset.filter;

		visualTabs.forEach((item) => {
			const isActive = item === tab;
			item.classList.toggle('is-active', isActive);
			item.setAttribute('aria-selected', String(isActive));
		});

		visualCards.forEach((card) => {
			card.hidden = filter !== 'all' && card.dataset.technology !== filter;
		});
	});
});

const latestBlogCard = document.querySelector('[data-latest-blog]');

if (latestBlogCard) {
	const latestPostEndpoint = 'https://sentidoanalitica.com/wp-json/wp/v2/posts?per_page=1&orderby=date&order=desc&_embed=1';

	const stripHtml = (html) => {
		const parser = new DOMParser();
		return parser.parseFromString(html, 'text/html').body.textContent.trim();
	};

	const formatPostDate = (date) => new Intl.DateTimeFormat('es-ES', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	}).format(new Date(date));

	const renderBlogMeta = (element, values) => {
		element.replaceChildren();

		values.forEach((value, index) => {
			if (index > 0) {
				const separator = document.createElement('span');
				separator.textContent = '·';
				element.append(separator);
			}

			element.append(document.createTextNode(value));
		});
	};

	fetch(latestPostEndpoint)
		.then((response) => {
			if (!response.ok) {
				throw new Error(`No se pudo obtener la última publicación: ${response.status}`);
			}

			return response.json();
		})
		.then(([post]) => {
			if (!post) {
				return;
			}

			const category = post._embedded?.['wp:term']?.[0]?.[0]?.name || 'Blog';
			const author = post._embedded?.author?.[0]?.name || 'José Rafael Escalante';
			const image = post._embedded?.['wp:featuredmedia']?.[0];
			const title = stripHtml(post.title.rendered);

			latestBlogCard.href = post.link;
			latestBlogCard.setAttribute('aria-label', `Leer ${title}`);
			latestBlogCard.querySelector('[data-blog-title]').textContent = title;
			renderBlogMeta(latestBlogCard.querySelector('[data-blog-meta]'), [
				formatPostDate(post.date),
				category,
				`Por ${author}`
			]);
			latestBlogCard.querySelector('[data-blog-intro]').textContent = stripHtml(post.excerpt.rendered);

			if (image?.source_url) {
				const blogImage = latestBlogCard.querySelector('[data-blog-image]');
				blogImage.src = image.source_url;
				blogImage.alt = image.alt_text || title;
			}
		})
		.catch(() => {
			// The static article in the markup remains available when the feed cannot be reached.
		});
}
