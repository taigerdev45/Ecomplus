"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./queues/pdf.queue");
require("./queues/whatsapp.queue");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const compression_1 = __importDefault(require("compression"));
const hpp_1 = __importDefault(require("hpp"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const whatsapp_routes_1 = __importDefault(require("./routes/whatsapp.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const config_routes_1 = __importDefault(require("./routes/config.routes"));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
// Security Middlewares
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
const ALLOWED_ORIGINS = [
    'https://ecomplus-web.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
    ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(s => s.trim()) : []),
];
const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (server-to-server, mobile, Postman…)
        if (!origin)
            return callback(null, true);
        if (ALLOWED_ORIGINS.includes(origin))
            return callback(null, true);
        // Allow any vercel.app preview deployment of the project
        if (/^https:\/\/ecomplus-.*\.vercel\.app$/.test(origin))
            return callback(null, true);
        callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
};
app.use((0, cors_1.default)(corsOptions));
// Handle preflight for ALL routes explicitly
app.options('*', (0, cors_1.default)(corsOptions));
app.use((0, hpp_1.default)()); // Prevent HTTP Parameter Pollution
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3000, // Increase threshold to 3000 to accommodate frequent chat and visit pollings
    message: 'Trop de requêtes effectuées depuis cette adresse IP, veuillez réessayer après 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);
// Performance Middlewares
app.use((0, compression_1.default)()); // Gzip compression
app.use(express_1.default.json({
    limit: '10kb',
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
})); // Limit body size
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)('dev'));
// Routes
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/products', product_routes_1.default);
app.use('/api/v1/orders', order_routes_1.default);
app.use('/api/v1/webhooks/whatsapp', whatsapp_routes_1.default);
app.use('/api/v1/admin', admin_routes_1.default);
app.use('/api/v1/config', config_routes_1.default);
app.use('/api/v1/chat', chat_routes_1.default);
// Error Handling
app.use(error_middleware_1.errorHandler);
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Une erreur interne est survenue',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});
const cleanup_service_1 = require("./services/cleanup.service");
const db_1 = require("./lib/db");
(0, cleanup_service_1.startCleanupScheduler)();
(0, db_1.initDb)();
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
