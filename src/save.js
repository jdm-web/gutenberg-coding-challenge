/**
 * Internal dependencies
 */
/**
 * WordPress dependencies
 */
import { useBlockProps } from '@wordpress/block-editor';
import Preview from './preview';

export default function Save( { attributes } ) {
	const blockProps = useBlockProps.save();
	return (
		<div { ...blockProps }>
			<Preview { ...attributes } />
		</div>
	);
}
