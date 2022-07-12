/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { createInterpolateElement } from '@wordpress/element';
/**
 * Internal dependencies
 */
import countries from '../assets/countries.json';
import continentNames from '../assets/continent-names.json';
import continents from '../assets/continents.json';
import { getEmojiFlag } from './utils';

const textDomain = 'xwp-country-card';

export default function Preview( { countryCode, relatedPosts } ) {
	if ( ! countryCode ) return null;

	const emojiFlag = getEmojiFlag( countryCode ),
		hasRelatedPosts = relatedPosts?.length > 0;

	const helloTranslatedString = createInterpolateElement(
		sprintf(
			/* translators: country name, then country code, then continent name */
			__(
				'Hello from <strong>%1$s</strong> (<span>%2$s</span>), %3$s!',
				textDomain
			),
			countries[ countryCode ],
			countryCode,
			continentNames[ continents[ countryCode ] ]
		),
		{
			strong: <strong />,
			span: <span className="xwp-country-card__country-code" />,
		}
	);

	const displayRelatedPostsCount = () => {
		if ( ! hasRelatedPosts ) {
			return __( 'There are no related posts.', textDomain );
		}
		if ( relatedPosts.length === 1 ) {
			return __( 'There is one related post:', textDomain );
		}
		return sprintf(
			/* translators: %d is replaced with the number of related posts */
			__( 'There are %d related posts:', textDomain ),
			relatedPosts.length
		);
	};

	const escape = ( dangerousString ) => {
		const div = document.createElement( 'div' );
		div.innerHTML = dangerousString;
		return div.innerText;
	};

	return (
		<div className="xwp-country-card">
			<div
				className="xwp-country-card__media"
				data-emoji-flag={ emojiFlag }
			>
				<div className="xwp-country-card-flag">{ emojiFlag }</div>
			</div>
			<h3 className="xwp-country-card__heading">
				{ helloTranslatedString }
			</h3>
			<div className="xwp-country-card__related-posts">
				<h3 className="xwp-country-card__related-posts__heading">
					{ displayRelatedPostsCount() }
				</h3>
				{ hasRelatedPosts && (
					<ul className="xwp-country-card__related-posts-list">
						{ relatedPosts.map( ( relatedPost, index ) => (
							<li key={ index } className="related-post">
								<a
									className="link"
									href={ relatedPost.link }
									data-post-id={ relatedPost.id }
								>
									<h3 className="title">
										{ escape( relatedPost.title ) }
									</h3>
									{ relatedPost.excerpt && (
										<p className="excerpt">
											{ escape( relatedPost.excerpt ) }
										</p>
									) }
								</a>
							</li>
						) ) }
					</ul>
				) }
			</div>
		</div>
	);
}
