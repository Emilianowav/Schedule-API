import TurnoCard from "./TurnoCard";
import styles from './TurnosList.module.css';

interface TurnosListProps {
    turnos: Array<{ id: number; nombre: string; consultorio: string }>;
    onDelete: (id: number) => void;
}

const TurnosList: React.FC<TurnosListProps> = ({ turnos, onDelete }) => {
    
    return (
        <div className={styles.content}>
            <ul className={styles.ul}>
                {turnos.map((turno) => (
                    <TurnoCard key={turno.id} turno={turno} onDelete={onDelete} />
                ))}
            </ul>
        </div>
    );
};

export default TurnosList;
