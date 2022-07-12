/**
 * WordPress dependencies
 */
import { edit, globe } from '@wordpress/icons';
import { BlockControls, useBlockProps } from '@wordpress/block-editor';
import {
	ComboboxControl,
	Placeholder,
	ToolbarButton,
	ToolbarGroup,
} from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import './editor.scss';
import countries from '../assets/countries.json';
import { getEmojiFlag } from './utils';
import Preview from './preview';

//Computing the country selector options
const options = Object.keys( countries ).map( ( code ) => ( {
	value: code,
	label: getEmojiFlag( code ) + '  ' + countries[ code ] + ' — ' + code,
} ) );

export default function Edit( { attributes, setAttributes, context } ) {
	const { countryCode, relatedPosts } = attributes;
	const [ isPreview, setPreview ] = useState();

	useEffect( () => {
		return setPreview( countryCode );
	}, [ countryCode ] );

	const handleChangeCountry = () => {
		if ( isPreview ) setPreview( false );
		else if ( countryCode ) setPreview( true );
	};

	const handleChangeCountryCode = ( newCountryCode ) => {
		if ( newCountryCode && countryCode !== newCountryCode ) {
			setAttributes( {
				countryCode: newCountryCode,
				relatedPosts: [],
			} );
		}
	};

	useEffect( () => {
		async function getRelatedPosts() {
			//If there's no country code yet, no need to search for related posts
			if ( ! countryCode ) {
				return;
			}

			//If the country code is unknown, throw an error
			if ( ! countries[ countryCode ] ) {
				throw new Error(
					`[country-card] Unknown country code: ${ countryCode }`
				);
			}

			const postId = context.postId;
			const posts = await apiFetch( {
				path: `/wp/v2/posts?search=${ countries[ countryCode ] }&exclude=${ postId }&context=embed`,
			} ).catch( ( error ) => {
				throw new Error(
					`[country-card] API fetch error (${ error.code }): ${ error.message }`
				);
			} );

			setAttributes( {
				relatedPosts:
					posts?.map( ( relatedPost ) => ( {
						...relatedPost,
						title: relatedPost.title?.rendered || relatedPost.link,
						excerpt: relatedPost.excerpt?.rendered || '',
					} ) ) || [],
			} );
		}

		getRelatedPosts();
	}, [ countryCode, setAttributes ] );

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						label={ __( 'Change Country', 'xwp-country-card' ) }
						icon={ edit }
						onClick={ handleChangeCountry }
						disabled={ ! Boolean( countryCode ) }
					/>
				</ToolbarGroup>
			</BlockControls>
			<div { ...useBlockProps() }>
				{ isPreview ? (
					<Preview
						countryCode={ countryCode }
						relatedPosts={ relatedPosts }
					/>
				) : (
					<Placeholder
						icon={ globe }
						label={ __( 'XWP Country Card', 'xwp-country-card' ) }
						isColumnLayout={ true }
						instructions={ __(
							'Type in a name of a country you want to display on you site.',
							'xwp-country-card'
						) }
					>
						<ComboboxControl
							label={ __( 'Country', 'xwp-country-card' ) }
							hideLabelFromVision
							options={ options }
							value={ countryCode }
							onChange={ handleChangeCountryCode }
							allowReset={ true }
						/>
					</Placeholder>
				) }
			</div>
		</>
	);
}
