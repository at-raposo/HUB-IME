import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with server-side environment variables
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

/**
 * 💣 O Vácuo Nuclear: Deleta fisicamente todos os ativos do storage
 */
export async function purgeStorageFolder(folderPath: string = 'assets/submissions') {
    try {
        if (process.env.NODE_ENV === 'development') console.log(`[V3.1.0] Iniciando expurgo de storage: ${folderPath}`);
        const result = await cloudinary.api.delete_folder(folderPath);
        return { success: true, result };
    } catch (error: any) {
        if (process.env.NODE_ENV === 'development') console.error('[V3.1.0] Erro ao limpar storage:', error);
        return { success: false, error: error.message };
    }
}

export default cloudinary;
