const youtubedl = require('youtube-dl-exec');

// Kaliteye ve formata göre format ayarlayan yardımcı fonksiyon
const getFormatString = (quality, format) => {
    let formatString;

    if (format === 'mp3') {
        formatString = 'bestaudio/best';
    } else {
        switch (quality) {
            case 'lowest':
                formatString = 'worstvideo[ext=mp4]+worstaudio[ext=m4a]/worst[ext=mp4]/worst';
                break;
            case 'medium':
                formatString = 'bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480][ext=mp4]/best[ext=mp4]/best';
                break;
            case 'highest':
            default:
                formatString = 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best';
                break;
        }
    }

    console.log(`Seçilen kalite: ${quality}, Format: ${format}, Format string: ${formatString}`);
    return formatString;
};

const downloadVideo = async (req, res) => {
    const { url, quality, format } = req.body;
    console.log(`İstek alındı - URL: ${url}, Kalite/Bitrate: ${quality}, Format: ${format}`);

    try {
        // Önce video bilgilerini al
        const videoInfo = await youtubedl(url, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
        });

        console.log('Video bilgileri alındı:', videoInfo.title);

        const formatString = getFormatString(quality, format);
        const qualitySuffix = format === 'mp3' ? `_${quality}kbps` : `_${quality}`;

        const options = {
            output: `./downloads/%(title)s${qualitySuffix}.%(ext)s`,
            format: formatString,
            // MP3 için ses çıkar
            ...(format === 'mp3' && {
                extractAudio: true,
                audioFormat: 'mp3',
                postprocessorArgs: [`-b:a ${quality}k`],
            }),
            // MP4 ise birleştirme formatını belirle
            ...(format === 'mp4' && {
                mergeOutputFormat: 'mp4',
            }),
        };

        console.log('İndirme seçenekleri:', JSON.stringify(options, null, 2));

        const output = await youtubedl(url, options);

        console.log('İndirme başarılı:', output);
        res.json({ message: format === 'mp3' ? 'Ses dosyası başarıyla indirildi' : 'Video başarıyla indirildi', output, videoInfo });
    } catch (err) {
        console.error('İndirme hatası:', err);
        console.error('Detaylı hata:', err.stderr);
        res.status(500).json({ message: 'Dosya indirme sırasında bir hata oluştu', error: err.message });
    }
};

module.exports = { downloadVideo };