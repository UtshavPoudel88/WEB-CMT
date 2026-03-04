import '@testing-library/jest-dom';


jest.mock('next/link', () => {
	const React = require('react');

	return {
		__esModule: true,
		default: ({ href, children, ...props }: any) =>
			React.createElement(
				'a',
				{
					href: typeof href === 'string' ? href : href?.pathname ?? '',
					...props,
				},
				children
			),
	};
});