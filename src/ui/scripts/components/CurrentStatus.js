import { createElement as h } from 'react'
import PropTypes from 'prop-types'

import Status, { ICON_LOADER, ICON_UPDATER } from './Status'
import Tooltip from './Tooltip'

const CurrentStatus = (props) => {
	if (props.isInitializing === true) return h(Status, {
		icon: ICON_LOADER,
	}, '加载中')

	if (props.isUpdating === true) return h(Status, {
		icon: ICON_UPDATER,
	}, '正在更新')

	if (props.isEmpty === true) return h(Status, {},
		'没有数据',
		h(Tooltip, {}, '在 ackee-tracker 中没有可用数据或收集详细数据被禁用。'),
	)

	return h(Status, {}, props.children)
}

CurrentStatus.propTypes = {
	isEmpty: PropTypes.bool.isRequired,
	isInitializing: PropTypes.bool.isRequired,
	isUpdating: PropTypes.bool.isRequired,
	children: PropTypes.node.isRequired,
}

export default CurrentStatus