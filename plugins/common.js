export default function ({ app }, inject) {
    inject('is_dev', !process.env.BASE_URL)
}