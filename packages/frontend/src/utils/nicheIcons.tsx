
import {
    Code2,
    GraduationCap,
    Users,
    Banknote,
    HeartPulse,
    ShoppingBag,
    Megaphone,
    Scale,
    HardHat,
    Palette,
    Box,
    MoreHorizontal
} from 'lucide-react';

export const getNicheIcon = (niche: string, className?: string) => {
    const props = { className: className || "w-5 h-5" };

    switch (niche) {
        case 'tecnologia':
            return <Code2 {...props} />;
        case 'educacao':
            return <GraduationCap {...props} />;
        case 'recursos_humanos':
            return <Users {...props} />;
        case 'financeiro':
            return <Banknote {...props} />;
        case 'saude':
            return <HeartPulse {...props} />;
        case 'vendas':
            return <ShoppingBag {...props} />;
        case 'marketing':
            return <Megaphone {...props} />;
        case 'juridico':
            return <Scale {...props} />;
        case 'engenharia':
            return <HardHat {...props} />;
        case 'design':
            return <Palette {...props} />;
        case 'produto':
            return <Box {...props} />;
        case 'outro':
        default:
            return <MoreHorizontal {...props} />;
    }
};
