const Upscaler = require('upscaler/node');
const tf = require('@tensorflow/tfjs-node');
const axios = require('axios');
const uModel = require('@upscalerjs/esrgan-legacy/div2k/2x');
const upscaler = new Upscaler({
	model: uModel
});

const { storeImage, getStoredImage } = require('./sqlite');

async function getUpscaledImage(url) {
	const imageResponse = await axios.get(url, { responseType: 'arraybuffer' });
	const buffer = Buffer.from(imageResponse.data);
	const image = tf.node.decodeImage(buffer, 3);
	const tensor = await upscaler.upscale(image, {
		output: 'tensor',
		patchSize: 64,
		padding: 2,
		progress: (ammount) => { }
	});
	image.dispose();
	const upscaledTensor = Buffer.from(await tf.node.encodePng(tensor));
	tensor.dispose();
	storeImage(url, upscaledTensor);
	return upscaledTensor;
}

async function getImage(url) {
	const storedImage = getStoredImage(url);
	if (storedImage) return storedImage;
	return getUpscaledImage(url);
}

module.exports = {
	getImage
}