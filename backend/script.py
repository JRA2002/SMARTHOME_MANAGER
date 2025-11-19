import subprocess
import shlex
import sys
import re

def ejecutar_comando_lsof(puerto):
    """
    Ejecuta lsof y extrae el PID del proceso que usa el puerto.
    """
    comando = f"lsof -i :{puerto}"
    print(f"-> Verificando el puerto: {puerto}")
    print(f"-> Ejecutando: '{comando}'")

    try:
        proceso = subprocess.run(
            shlex.split(comando),
            capture_output=True,
            text=True,
            check=False # No lanzar error si no encuentra nada (lsof retorna 1)
        )
        
        # El comando lsof devuelve el PID si lo encuentra, o una salida vacía si no.
        if proceso.stdout:
            # La salida de lsof tiene encabezados. Queremos solo las líneas de datos.
            lineas_datos = proceso.stdout.strip().split('\n')[1:] 
            
            if not lineas_datos:
                print(f"✅ El puerto {puerto} está **libre** (lsof no encontró procesos).")
                return None
                
            print("\n--- Proceso Encontrado Usando el Puerto ---")
            print(proceso.stdout)
            
            # Usar una expresión regular para encontrar el PID en la primera columna de la primera línea de datos
            # La expresión busca números al principio de la línea
            match = re.search(r'^\S+\s+(\d+)', lineas_datos[0])
            
            if match:
                pid = match.group(1)
                return pid
            else:
                print("⚠️ Advertencia: Se encontraron datos, pero no se pudo extraer el PID.")
                return None
        else:
            print(f"✅ El puerto {puerto} está **libre**.")
            return None

    except FileNotFoundError:
        print(f"\n❌ Error: El comando 'lsof' no fue encontrado.", file=sys.stderr)
        print("Asegúrate de que 'lsof' esté instalado y en tu PATH.", file=sys.stderr)
        sys.exit(1)
    
    except Exception as e:
        print(f"\n❌ Ocurrió un error inesperado: {e}", file=sys.stderr)
        sys.exit(1)

def terminar_proceso(pid):
    """
    Ejecuta el comando 'kill -9 <PID>' para terminar el proceso.
    """
    comando_kill = f"kill -9 {pid}"
    print(f"\n-> Intentando terminar el proceso con PID: {pid}")
    print(f"-> Ejecutando: '{comando_kill}'")

    try:
        subprocess.run(
            shlex.split(comando_kill),
            check=True,
            capture_output=True
        )
        print(f"🎉 **¡Éxito!** El proceso {pid} ha sido terminado.")
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Error al intentar terminar el proceso {pid}.", file=sys.stderr)
        print(f"Mensaje de error: {e.stderr.decode().strip()}", file=sys.stderr)
        print("Asegúrate de tener los permisos necesarios (ej: usar 'sudo' si es un proceso root).", file=sys.stderr)
        
def run_server():
    print("\n--- Iniciando Servidor ---")
    try:
        subprocess.run(["uvicorn", "app.main:app", "--reload"])
    except Exception as e:
        print(f"\n❌ Error al iniciar el servidor: {str(e)}", file=sys.stderr)
        sys.exit(1)
        
# --- Punto de Entrada Principal ---

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python verificar_puerto.py <número_de_puerto>")
        sys.exit(1)
    
    puerto_a_verificar = sys.argv[1]

    if not puerto_a_verificar.isdigit():
        print(f"❌ Error: '{puerto_a_verificar}' no es un número de puerto válido.")
        sys.exit(1)

    # Paso 1: Obtener el PID
    pid_encontrado = ejecutar_comando_lsof(puerto_a_verificar)

    if pid_encontrado:
        print(f"\n--- Acción Requerida ---")
        respuesta = input(f"Se encontró un proceso (PID: {pid_encontrado}) usando el puerto {puerto_a_verificar}. ¿Deseas terminarlo? (s/N): ").lower()
        
        if respuesta == 's':
            # Paso 2: Terminar el proceso
            terminar_proceso(pid_encontrado)
            run_server()
        else:
            print("Operación cancelada. El proceso no fue terminado.")
    else:
        run_server()