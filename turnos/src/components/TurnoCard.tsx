import styles from './TurnoCard.module.css';

interface TurnoItemProps {
    turno: { id: number; nombre: string; consultorio: string };
    onDelete: (id: number) => void;
}

const TurnoItem: React.FC<TurnoItemProps> = ({ turno, onDelete }) => {
    return (
        <li className={styles.turno}>
            <h3 className={styles.h3}>{turno.nombre}</h3>
            <h4 className={styles.h5}>{turno.consultorio}</h4>
            {/* <button onClick={() => onDelete(turno.id)}>Eliminar</button> */}
        </li>
    );
};

export default TurnoItem;
