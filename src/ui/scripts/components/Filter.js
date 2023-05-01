import { createElement as h, Fragment, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'

import * as routes from '../constants/routes'
import useRoute from '../hooks/useRoute'

import * as views from '../../../constants/views'
import * as referrers from '../../../constants/referrers'
import * as systems from '../../../constants/systems'
import * as devices from '../../../constants/devices'
import * as browsers from '../../../constants/browsers'
import * as sizes from '../../../constants/sizes'
import * as sortings from '../../../constants/sortings'
import * as ranges from '../../../constants/ranges'
import * as intervals from '../../../constants/intervals'

import Context, { BUTTON, SEPARATOR } from './Context'
import IconChevronDown from './icons/IconChevronDown'

const labels = {
	sortings: {
		[sortings.SORTINGS_TOP]: 'Top',
		[sortings.SORTINGS_NEW]: 'New',
		[sortings.SORTINGS_RECENT]: 'Recent',
	},
	ranges: {
		[ranges.RANGES_LAST_24_HOURS]: '24 hours',
		[ranges.RANGES_LAST_7_DAYS]: '7 days',
		[ranges.RANGES_LAST_30_DAYS]: '30 days',
		[ranges.RANGES_LAST_6_MONTHS]: '6 months',
	},
	intervals: {
		[intervals.INTERVALS_DAILY]: 'Daily',
		[intervals.INTERVALS_MONTHLY]: 'Monthly',
		[intervals.INTERVALS_YEARLY]: 'Yearly',
	},
	views: {
		[views.VIEWS_TYPE_UNIQUE]: 'Unique',
		[views.VIEWS_TYPE_TOTAL]: 'Total',
	},
	referrers: {
		[referrers.REFERRERS_TYPE_WITH_SOURCE]: 'Combined',
		[referrers.REFERRERS_TYPE_NO_SOURCE]: 'Referrers',
		[referrers.REFERRERS_TYPE_ONLY_SOURCE]: 'Sources',
	},
	sizes: {
		[sizes.SIZES_TYPE_BROWSER_RESOLUTION]: 'Browser sizes',
		[sizes.SIZES_TYPE_BROWSER_WIDTH]: 'Browser widths',
		[sizes.SIZES_TYPE_BROWSER_HEIGHT]: 'Browser heights',
		[sizes.SIZES_TYPE_SCREEN_RESOLUTION]: 'Screen sizes',
		[sizes.SIZES_TYPE_SCREEN_WIDTH]: 'Screen widths',
		[sizes.SIZES_TYPE_SCREEN_HEIGHT]: 'Screen heights',
	},
}

const calculateX = (measurement) => {
	const padding = 10

	return Math.max(
		padding,
		Math.min(
			// Ensure that the context stays on the screen
			measurement.body.width - measurement.element.width - padding,
			// Ensure that the context is pinned to the target
			measurement.target.relative.x + measurement.target.width / 2 - measurement.element.width / 2,
		),
	)
}

const calculateY = (measurement) => {
	return measurement.target.relative.y - measurement.element.height - 10
}

const createItem = (label, items, visible = true) => ({
	label,
	items,
	visible,
})

const createButton = (label, description, setter, key, value) => ({
	type: BUTTON,
	label,
	description,
	active: key === value,
	onClick: () => setter(value),
})

const createSeparator = () => ({
	type: SEPARATOR,
})

const onlyInactiveButton = (...buttons) => {
	return buttons.find((button) => button.active === false)
}

const FilterItem = (props) => {
	const ref = useRef()
	const [ active, setActive ] = useState(false)

	const close = () => setActive(false)
	const toggle = () => setActive(!active)

	if (props.visible === false) return null

	return (
		h(Fragment, {},
			h('button', {
				ref,
				className: 'filter__button color-white link',
				onClick: toggle,
			},
				h('span', {}, props.label),
				h(IconChevronDown, { className: 'filter__arrow' }),
			),
			active === true && h(Context, {
				targetRef: ref,
				fixed: true,
				x: calculateX,
				y: calculateY,
				floating: true,
				items: props.items,
				onItemClick: close,
				onAwayClick: close,
			}),
		)
	)
}

const Filter = (props) => {
	const sortingButtons = [
		createButton('访问人数', '热门条目优先', props.setSortingFilter, props.filters.sorting, sortings.SORTINGS_TOP),
		createButton('新的', '只有新条目', props.setSortingFilter, props.filters.sorting, sortings.SORTINGS_NEW),
		createButton('最近的', '按时间排序', props.setSortingFilter, props.filters.sorting, sortings.SORTINGS_RECENT),
	]

	const rangeButtons = [
		createButton('24 小时', '展示最近24小时的', props.setRangeFilter, props.filters.range, ranges.RANGES_LAST_24_HOURS),
		createButton('7 天', '展示最近7天的', props.setRangeFilter, props.filters.range, ranges.RANGES_LAST_7_DAYS),
		createButton('30 天', '展示最近30天的', props.setRangeFilter, props.filters.range, ranges.RANGES_LAST_30_DAYS),
		createButton('6 月', '展示最近6月的', props.setRangeFilter, props.filters.range, ranges.RANGES_LAST_6_MONTHS),
	]

	const intervalsButtons = [
		createButton('每天', '按天分组', props.setIntervalFilter, props.filters.interval, intervals.INTERVALS_DAILY),
		createButton('每月', '按天分组', props.setIntervalFilter, props.filters.interval, intervals.INTERVALS_MONTHLY),
		createButton('每年', '按天分组', props.setIntervalFilter, props.filters.interval, intervals.INTERVALS_YEARLY),
	]

	const sortingItem = createItem(labels.sortings[props.filters.sorting], sortingButtons)
	const rangeItem = createItem(labels.ranges[props.filters.range], rangeButtons, props.filters.sorting === sortings.SORTINGS_TOP)
	const intervalItem = createItem(labels.intervals[props.filters.interval], intervalsButtons)

	const routesMap = {
		[routes.VIEWS]: [
			createItem(labels.views[props.filters.viewsType], [
				createButton('突出', '突出的页面访问数', props.setViewsTypeFilter, props.filters.viewsType, views.VIEWS_TYPE_UNIQUE),
				createButton('总和', '总共的页面访问数', props.setViewsTypeFilter, props.filters.viewsType, views.VIEWS_TYPE_TOTAL),
			]),
			intervalItem,
		],
		[routes.PAGES]: [
			sortingItem,
			rangeItem,
		],
		[routes.REFERRERS]: [
			sortingItem,
			createItem(labels.referrers[props.filters.referrersType], [
				createButton('源参数', '首选源参数', props.setReferrersTypeFilter, props.filters.referrersType, referrers.REFERRERS_TYPE_WITH_SOURCE),
				createButton('↳ 只有引荐来源', undefined, props.setReferrersTypeFilter, props.filters.referrersType, referrers.REFERRERS_TYPE_NO_SOURCE),
				createButton('↳ 只有来源', undefined, props.setReferrersTypeFilter, props.filters.referrersType, referrers.REFERRERS_TYPE_ONLY_SOURCE),
			]),
			rangeItem,
		],
		[routes.DURATIONS]: [
			intervalItem,
		],
		[routes.EVENTS]: [
			intervalItem,
			sortingItem,
		],
		[routes.SYSTEMS]: [
			createItem(labels.sortings[props.filters.sorting], [
				...sortingButtons,
				createSeparator(),
				onlyInactiveButton(
					createButton('显示版本', '包含系统版本', props.setSystemsTypeFilter, props.filters.systemsType, systems.SYSTEMS_TYPE_WITH_VERSION),
					createButton('隐藏版本', '不包含系统版本', props.setSystemsTypeFilter, props.filters.systemsType, systems.SYSTEMS_TYPE_NO_VERSION),
				),
			]),
			rangeItem,
		],
		[routes.DEVICES]: [
			createItem(labels.sortings[props.filters.sorting], [
				...sortingButtons,
				createSeparator(),
				onlyInactiveButton(
					createButton('显示设备型号', '包括设备型号', props.setDevicesTypeFilter, props.filters.devicesType, devices.DEVICES_TYPE_WITH_MODEL),
					createButton('隐藏设备型号', '不包括设备型号', props.setDevicesTypeFilter, props.filters.devicesType, devices.DEVICES_TYPE_NO_MODEL),
				),
			]),
			rangeItem,
		],
		[routes.BROWSERS]: [
			createItem(labels.sortings[props.filters.sorting], [
				...sortingButtons,
				createSeparator(),
				onlyInactiveButton(
					createButton('显示版本', '包含浏览器版本', props.setBrowsersTypeFilter, props.filters.browsersType, browsers.BROWSERS_TYPE_WITH_VERSION),
					createButton('隐藏版本', '不包含浏览器版本', props.setBrowsersTypeFilter, props.filters.browsersType, browsers.BROWSERS_TYPE_NO_VERSION),
				),
			]),
			rangeItem,
		],
		[routes.SIZES]: [
			sortingItem,
			createItem(labels.sizes[props.filters.sizesType], [
				createButton('浏览器大小', '宽度和高度组合', props.setSizesTypeFilter, props.filters.sizesType, sizes.SIZES_TYPE_BROWSER_RESOLUTION),
				createButton('↳ 宽度', undefined, props.setSizesTypeFilter, props.filters.sizesType, sizes.SIZES_TYPE_BROWSER_WIDTH),
				createButton('↳ 高度', undefined, props.setSizesTypeFilter, props.filters.sizesType, sizes.SIZES_TYPE_BROWSER_HEIGHT),
				createSeparator(),
				createButton('屏幕尺寸', '宽度和高度组合', props.setSizesTypeFilter, props.filters.sizesType, sizes.SIZES_TYPE_SCREEN_RESOLUTION),
				createButton('↳ 宽度', undefined, props.setSizesTypeFilter, props.filters.sizesType, sizes.SIZES_TYPE_SCREEN_WIDTH),
				createButton('↳ 高度', undefined, props.setSizesTypeFilter, props.filters.sizesType, sizes.SIZES_TYPE_SCREEN_HEIGHT),
			]),
			rangeItem,
		],
		[routes.LANGUAGES]: [
			sortingItem,
			rangeItem,
		],
	}

	const currentRoute = useRoute(props.route)
	const currentButtons = routesMap[currentRoute.key]

	if (currentButtons == null) return null

	const buttons = currentButtons.map((button) => h(FilterItem, button))

	return createPortal(
		h('div', { className: 'filter' },
			h('div', { className: 'filter__bar' }, ...buttons),
		),
		document.body,
	)
}

Filter.propTypes = {
	filters: PropTypes.object.isRequired,
	setSortingFilter: PropTypes.func.isRequired,
	setRangeFilter: PropTypes.func.isRequired,
	setIntervalFilter: PropTypes.func.isRequired,
	setViewsTypeFilter: PropTypes.func.isRequired,
	setReferrersTypeFilter: PropTypes.func.isRequired,
	setDevicesTypeFilter: PropTypes.func.isRequired,
	setBrowsersTypeFilter: PropTypes.func.isRequired,
	setSizesTypeFilter: PropTypes.func.isRequired,
	setSystemsTypeFilter: PropTypes.func.isRequired,
	route: PropTypes.string.isRequired,
}

export default Filter