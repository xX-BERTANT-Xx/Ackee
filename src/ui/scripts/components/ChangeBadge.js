import { createElement as h } from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'

import IconArrowRight from './icons/IconArrowRight'

const type = (value) => {
	if (value > 5) return 'positive'
	if (value < -5) return 'negative'

	return 'neutral'
}

const title = (value, formattedValue) => {
	if (value > 0) return `${ formattedValue } 过去 7 天与前 7 天相比有所增加`
	if (value < 0) return `${ formattedValue } 过去 7 天与前 7 天相比有所减少`

	return `最近 7 天与前 7 天比没有变化`
}

const ChangeBadge = (props) => {
	const value = props.value
	const formattedValue = `${ Math.abs(props.value) }%`

	return (
		h('div', {
			className: classNames(
				'badge',
				'badge--with-icon',
				`badge--${ type(value) }`,
			),
			title: title(value, formattedValue),
		},
			h(IconArrowRight, { className: 'badge__icon' }),
			h('span', { className: 'badge__value' }, formattedValue),
		)
	)
}

ChangeBadge.propTypes = {
	value: PropTypes.number.isRequired,
}

export default ChangeBadge