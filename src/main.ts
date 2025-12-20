import dotenv from 'dotenv';
dotenv.config();
import app from './app';

const PORT: number = Number(process.env.PORT) || 3000;

// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}.`);
// });
if (require.main === module || process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        try {
            // scheduleOverdueCheck();
            // scheduleSoonOverdueCheck();
        } catch (error) {
            console.error("Error initializing scheduled tasks:", error);
        }
    });
}

export default app;