define([
  'libs/face/ccv'
  'libs/face/face'
], () ->
	
	backCanvas = document.createElement "canvas"
	backContext = backCanvas.getContext "2d"
	w = 300 / 4 * 0.8
	h = 270 / 4 * 0.8
	cache = {}

	enabled = false

	pub = 

		init: (x, y, width, height) ->
			
			backCanvas.width = 120
			backCanvas.height = 80

			cache.comp = [{
				x: x
				y: y
				width: backCanvas.width
				height: backCanvas.height
			}]

			$.subscribe "/tracking/enable", (set) ->
				enabled = set

		track: (video) ->

			track = 
				faces: []
				trackWidth: backCanvas.width
			
			return track unless enabled

			backContext.drawImage video, 0, 0, backCanvas.width, backCanvas.height

			comp = ccv.detect_objects cache.ccv = cache.ccv || {
				canvas: ccv.grayscale(backCanvas)
				cascade: cascade,
				interval: 5,
				min_neighbors: 1
			}

			if comp.length
				cache.comp = comp

			for i in cache.comp

				track.faces.push {
					x: i.x
					y: i.y
					width: i.width
					height: i.height
				}

			return track;

)