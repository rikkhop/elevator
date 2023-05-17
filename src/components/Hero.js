export default function Hero() {
    return (
        <section className="hero relative pt-36 pb-16 bg-[#cadc72] before:block before:absolute before:top-[-4rem] before:w-full before:h-full before:bg-[url('./images/bg-hills.svg')] before:bg-top before:bg-[length:100%] before:bg-no-repeat before:z-0">
            <div className="container relative">
                <div className="row justify-center">
                    <div className="w-full md:w-2/3">
                        <p className="text-[1.4rem]">It can be difficult to see the steep slopes when you're planning your hikes on a map. Don't let that challenging terrain catch you out again. Plot out your walking route on the map below to see the changes in elevation that could stop you in your tracks.</p>
                    </div>
                </div>
            </div>
        </section>
    )
}