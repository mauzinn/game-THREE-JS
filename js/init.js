import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js'
import * as CANNON from 'https://cdn.skypack.dev/cannon-es'
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js'


function init() {
    

    //Physics
        const world = new CANNON.World({
            gravity: new CANNON.Vec3(0, -9.81, 0)
        })


    //Configurations
        let KeyPress = false

        const loader = new GLTFLoader()
        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )

        const renderer = new THREE.WebGLRenderer()
        renderer.setSize( window.innerWidth, window.innerHeight )
        document.body.appendChild( renderer.domElement )


        camera.position.z = 6
        camera.position.y = 6
        camera.position.x = 6


    //Map
        //Player
            const playerGeometry = new THREE.SphereGeometry(0.8, 20, 20)
            const playerMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, wireframe: true })
            const player = new THREE.Mesh(playerGeometry, playerMaterial)

            const playerBody = new CANNON.Body({
                shape: new CANNON.Sphere(0.5),
                mass: 43,
                position: new CANNON.Vec3(0, 3, 0)
            })

            let robot

            loader.load('models/Robot.glb', (gltf) => {
                robot = gltf.scene

                robot.scale.set(0.3, 0.3, 0.3)

                scene.add(robot)

                let Clock = new THREE.Clock()
                const mixer = new THREE.AnimationMixer(robot)
                let action = mixer.clipAction(gltf.animations[2])
                action.play()
                

                document.addEventListener('keydown', (e) => {
                    let animationsKeys = {
                        w: 10,
                        s: 10,
                        ' ': 11,
                        Shift: 6
                    }

                    if (!KeyPress) {
                        KeyPress = true
                        action.stop()
                        action = mixer.clipAction(gltf.animations[animationsKeys[e.key]])
                        action.play()
                    }
                })

                document.addEventListener('keyup', () => {
                    if (KeyPress) {
                        KeyPress = false
                        action.stop()
                        action = mixer.clipAction(gltf.animations[2])
                        action.play()
                    }
                })

                function load() {
                    requestAnimationFrame(load)
    
                    mixer.update(Clock.getDelta())
                }
    
                load()
    
            })


        //Ground
            const groundGeometry = new THREE.BoxGeometry(45, 0.5, 45)
            const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x0FF00, wireframe: true })
            const ground = new THREE.Mesh(groundGeometry, groundMaterial)

            const groundBody = new CANNON.Body({
                shape: new CANNON.Box(new CANNON.Vec3(45 / 2, 0.5, 45 / 2)),
                type: CANNON.Body.STATIC
            })


        //Wall
            const wallGeometry = new THREE.BoxGeometry(8, 5, 1)
            const wallMaterial = new THREE.MeshBasicMaterial({ color: 0x0FF00, wireframe: true })
            const wall = new THREE.Mesh(wallGeometry, wallMaterial)

            const wallBody = new CANNON.Body({
                shape: new CANNON.Box(new CANNON.Vec3(8 / 2, 5, 1 / 1.3)),
                type: CANNON.Body.STATIC,
                position: new CANNON.Vec3(3, 2.8, 5)
            })


        //Box
            const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
            const boxMaterial = new THREE.MeshBasicMaterial({ color: 0x00FFFF, wireframe: true })
            const box = new THREE.Mesh(boxGeometry, boxMaterial)
            const boxBody = new CANNON.Body({
                shape: new CANNON.Box(new CANNON.Vec3(1 / 3, 1 / 3, 1 / 3)),
                mass: 3,
                position: new CANNON.Vec3(6, 8, 9)
            })

        
        //Load 
            scene.add(player, box, ground, wall)
            world.addBody(playerBody)
            world.addBody(boxBody)
            world.addBody(wallBody)
            world.addBody(groundBody)


        //Movement player
            document.addEventListener('keydown', (e) => {
                let movimentValues = {
                    w: {
                        velocity: 1.8,
                        jump: 0,
                        rotation: Math.atan2(
                            (-camera.position.x - -player.position.x), 
                            (-camera.position.z - -player.position.z))
                    },
                    s: {
                        velocity: -1.8,
                        jump: 0,
                        rotation: Math.atan2(
                            (camera.position.x - player.position.x), 
                            (camera.position.z - player.position.z))
                    },
                    ' ': {
                        velocity: 1.8,
                        jump: 1,
                        rotation: Math.atan2(
                            (-camera.position.x - -player.position.x), 
                            (-camera.position.z - -player.position.z))
                    },
                    Shift: {
                        velocity: 3.12,
                        jump: 0,
                        rotation: Math.atan2(
                            (-camera.position.x - -player.position.x), 
                            (-camera.position.z - -player.position.z))
                    }
                }

                const moveSpeed = movimentValues[e.key].velocity

                // Obtém a direção para a qual a câmera está olhando
                const cameraDirection = new THREE.Vector3(0, 0, -1)
                camera.getWorldDirection(cameraDirection)
                
                const velocity = new CANNON.Vec3(cameraDirection.x, 0, cameraDirection.z).scale(moveSpeed)
                playerBody.velocity.copy(velocity)
                
                robot.rotation.y = movimentValues[e.key].rotation
            })

            document.addEventListener('keyup', () => {
                playerBody.velocity.set(0, 0, 0)
                playerBody.angularVelocity.set(0, 0, 0)
            })



    //Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const Light = new THREE.DirectionalLight(0xffffff, 1.3)
    Light.position.set(2, 5, 8)

    scene.add(Light)



    //OrbitControls
        const OrbitControl = new OrbitControls(camera, renderer.domElement)
        OrbitControl.maxDistance = 8
        OrbitControl.minDistance = 8
        OrbitControl.enablePan = false
        OrbitControl.maxPolarAngle = Math.PI / 2.5
        OrbitControl.minPolarAngle = Math.PI / 4



    //Render
        function LoadAll() {
            requestAnimationFrame( LoadAll )

            world.step(1 / 60)

            OrbitControl.update()
            OrbitControl.target.set(robot.position.x, robot.position.y, robot.position.z)

            ground.position.copy(groundBody.position)
            player.position.copy(playerBody.position)
            box.position.copy(boxBody.position)
            box.quaternion.copy(boxBody.quaternion)
            playerBody.rotation = player.rotation
            playerBody.quaternion.copy(player.quaternion)
            wall.position.copy(wallBody.position)

            robot.position.copy(playerBody.position)
            robot.position.y -= 0.7


            renderer.render( scene, camera )
        }

        LoadAll()


}

init()